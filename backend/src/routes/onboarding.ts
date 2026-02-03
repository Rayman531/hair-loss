import { Hono } from 'hono';
import { createDrizzleConnection } from '../db/drizzle';
import { onboardingQuestions, onboardingOptions, onboardingResponses } from '../db/schema';
import { eq, asc } from 'drizzle-orm';
import type {
  Question,
  QuestionOption,
  GetQuestionsResponse,
  SubmitResponsesRequest,
  SubmitResponsesResponse,
  ErrorResponse,
} from '../types/onboarding';

type Env = {
  DATABASE_URL: string;
};

const onboarding = new Hono<{ Bindings: Env }>();

// GET /api/onboarding/questions
onboarding.get('/questions', async (c) => {
  try {
    // Get database connection
    const db = createDrizzleConnection(c.env.DATABASE_URL);

    // Fetch all questions ordered by question_order
    const questions = await db
      .select()
      .from(onboardingQuestions)
      .orderBy(asc(onboardingQuestions.questionOrder));

    // Fetch all options
    const options = await db
      .select()
      .from(onboardingOptions)
      .orderBy(asc(onboardingOptions.questionId), asc(onboardingOptions.optionOrder));

    // Group options by question_id
    const optionsByQuestion = options.reduce((acc, option) => {
      if (!acc[option.questionId]) {
        acc[option.questionId] = [];
      }
      acc[option.questionId].push({
        id: option.id,
        text: option.optionText,
        order: option.optionOrder,
      });
      return acc;
    }, {} as Record<number, QuestionOption[]>);

    // Format response
    const formattedQuestions: Question[] = questions.map((q) => ({
      id: q.id,
      question: q.questionText,
      order: q.questionOrder,
      options: optionsByQuestion[q.id] || [],
    }));

    const response: GetQuestionsResponse = {
      success: true,
      data: formattedQuestions,
    };

    return c.json(response);
  } catch (error) {
    console.error('Error fetching onboarding questions:', error);
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: 'FETCH_QUESTIONS_ERROR',
        message: 'Failed to fetch onboarding questions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    };
    return c.json(errorResponse, 500);
  }
});

// POST /api/onboarding/responses
onboarding.post('/responses', async (c) => {
  try {
    // Get database connection
    const db = createDrizzleConnection(c.env.DATABASE_URL);

    const body = await c.req.json<SubmitResponsesRequest>();

    // Validate request body
    if (!body.sessionId || !body.responses || !Array.isArray(body.responses)) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Missing required fields: sessionId and responses array',
        },
      };
      return c.json(errorResponse, 400);
    }

    // Validate all 10 questions are answered
    if (body.responses.length !== 10) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'INVALID_RESPONSES',
          message: 'All 10 questions must be answered',
          details: {
            expected: 10,
            received: body.responses.length,
          },
        },
      };
      return c.json(errorResponse, 400);
    }

    // Validate each response has questionId and optionId
    for (const response of body.responses) {
      if (!response.questionId || !response.optionId) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: {
            code: 'INVALID_RESPONSE_FORMAT',
            message: 'Each response must have questionId and optionId',
          },
        };
        return c.json(errorResponse, 400);
      }
    }

    // Insert all responses into the database
    const insertPromises = body.responses.map((response) =>
      db.insert(onboardingResponses).values({
        sessionId: body.sessionId,
        questionId: response.questionId,
        optionId: response.optionId,
      })
    );

    await Promise.all(insertPromises);

    const completedAt = new Date().toISOString();
    const successResponse: SubmitResponsesResponse = {
      success: true,
      message: 'Onboarding responses recorded successfully',
      data: {
        sessionId: body.sessionId,
        completedAt,
        totalQuestions: body.responses.length,
      },
    };

    return c.json(successResponse, 201);
  } catch (error) {
    console.error('Error submitting onboarding responses:', error);
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: 'SUBMIT_RESPONSES_ERROR',
        message: 'Failed to submit onboarding responses',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    };
    return c.json(errorResponse, 500);
  }
});

export default onboarding;

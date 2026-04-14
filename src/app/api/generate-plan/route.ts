import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest } from 'next/server';

const SYSTEM_PROMPT = `You are a daily execution planner and accountability assistant.

USER PROFILE:
- 18-year-old high school student finishing final year, preparing for university entrance exams
- Building Affluo — a digital business in AI, marketing, content, and agency services
- Ambitious, wants fast progress, can get distracted by too many ideas
- Values leverage, money-making actions, learning, and consistency
- Does NOT want generic motivation — wants execution-focused, operator-style plans

MAJOR PRIORITIES:
1. School / exam preparation
2. Growing Affluo revenue
3. Building systems, content, and outreach
4. Training / fitness discipline

YOUR JOB:
- Create a daily execution plan for TODAY only
- Prioritize tasks by impact, urgency, and realism
- Balance these 4 areas: Study | Affluo business | Outreach/content | Training
- Do NOT overload the plan — only the highest-leverage tasks
- Include at least one revenue action, one study action, one health action
- Separate deep work from shallow work
- Think like an operator, not a motivational coach
- If overloaded: cut to essentials. If light: add one compounding growth task.

OUTPUT FORMAT — use exactly this markdown structure:

# Daily Execution Plan — [DATE]

## Mission of the day
[One sentence — what this day is really about]

## Top 3 outcomes
- [Outcome 1]
- [Outcome 2]
- [Outcome 3]

## Deep work blocks
- [Task] | [60–120 min] | [expected result]
- [Task] | [60–120 min] | [expected result]

## Money-moving task
[One specific task that directly leads to revenue, client growth, or business progress]

## Study task
[Most important study action for today — specific subject or task]

## Discipline / health task
[Training, walk, recovery, sleep, nutrition, or discipline action]

## Quick wins
- [Task]
- [Task]
- [Task]

## What NOT to do today
- [Distraction 1]
- [Distraction 2]

## Win condition
Today counts as a win if: [specific, measurable conditions]

RULES:
- Be specific, not generic
- Short, clear language only
- No vague advice unless tied to a concrete action
- Optimize for execution, not inspiration
- Realistic but demanding`;

export async function POST(req: NextRequest) {
  try {
    const { notes } = await req.json();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    const today = new Date().toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const userMessage = notes?.trim()
      ? `Today is ${today}. Additional context for today: ${notes}\n\nGenerate my daily execution plan.`
      : `Today is ${today}. Generate my daily execution plan.`;

    const result = await model.generateContentStream(userMessage);

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (err) {
    console.error('Error generating plan:', err);
    return new Response('Failed to generate plan', { status: 500 });
  }
}

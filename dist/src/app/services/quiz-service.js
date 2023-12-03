import { post } from './rest';
export async function calculateResult(answers) {
    return await post('calculate-result', { answers });
}
export async function checkAnswer(answerId, questionId) {
    return await post('check-answer', { answerId, questionId });
}

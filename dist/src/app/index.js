import { calculateResult, checkAnswer } from './services/quiz-service';
import './../styles/index.scss';
import { getQuestions } from './services/questions-service';
export class App {
    questionEl;
    answerBtns;
    nextBtn;
    currentQuestionIdx = 0;
    questions = [];
    answers = [];
    constructor() {
        this.questionEl = document.querySelector('#question-text');
        this.answerBtns = document.querySelector('#answer-buttons');
        this.nextBtn = document.querySelector('#next-btn');
    }
    async init() {
        this.questions = await getQuestions();
        this.nextBtn.addEventListener('click', () => this.nextBtnHandler());
        this.startQuiz();
    }
    async nextBtnHandler() {
        if (this.currentQuestionIdx < this.questions.length) {
            await this.goToNextQuestion();
        }
        else {
            this.startQuiz();
        }
    }
    startQuiz() {
        this.currentQuestionIdx = 0;
        this.showQuestion();
    }
    showQuestion() {
        this.resetState();
        let currentQuestion = this.questions[this.currentQuestionIdx];
        let questionNumber = this.currentQuestionIdx + 1;
        this.questionEl.innerHTML = `${questionNumber}. ${currentQuestion.question}`;
        currentQuestion.answers.forEach((item) => this.createAnswerButton(item));
    }
    resetState() {
        this.nextBtn.style.display = 'none';
        while (this.answerBtns.firstChild) {
            this.answerBtns.removeChild(this.answerBtns.firstChild);
        }
    }
    createAnswerButton(answer) {
        const button = document.createElement('button');
        button.innerHTML = answer.text;
        button.type = 'button';
        button.classList.add('button', 'question__answer');
        this.answerBtns.appendChild(button);
        button.dataset.id = answer.id.toString();
        button.addEventListener('click', this.selectAnswer);
    }
    async selectAnswer(e) {
        const selectedBtn = e.target;
        if (!selectedBtn.dataset.id) {
            throw Error('Can not find id info');
        }
        const answerId = +selectedBtn.dataset.id;
        const { isCorrect, correctAnswerId } = await checkAnswer(answerId, this.questions[this.currentQuestionIdx].id);
        if (isCorrect) {
            selectedBtn.classList.add('question__answer--correct');
        }
        else {
            selectedBtn.classList.add('question__answer--incorrect');
        }
        Array.from(this.answerBtns.children)
            .filter((element) => element instanceof HTMLButtonElement)
            .forEach((b) => {
            let button = b; // If we use force typing in 80 line it does not work.
            if (!button.dataset.id) {
                throw Error('Can not find id info');
            }
            if (+button.dataset.id === correctAnswerId) {
                button.classList.add('question__answer--correct');
            }
            button.disabled = true;
        });
        this.answers.push({
            questionId: this.questions[this.currentQuestionIdx].id,
            answerId
        });
        this.nextBtn.style.display = 'block';
    }
    async goToNextQuestion() {
        this.currentQuestionIdx++;
        if (this.currentQuestionIdx < this.questions.length) {
            this.showQuestion();
        }
        else {
            await this.showScore();
        }
    }
    async showScore() {
        this.resetState();
        const { score } = await calculateResult(this.answers);
        this.answers = [];
        this.questionEl.innerHTML = `You scored ${score} out of ${this.questions.length}`;
        this.nextBtn.innerHTML = 'Play Again';
        this.nextBtn.style.display = 'block';
    }
}
window.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});

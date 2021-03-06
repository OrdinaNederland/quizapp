import { Component, OnInit } from '@angular/core';
import { QuizService } from '../services/quiz.service';
import { SubmitAnswer } from '../model/submitAnswer';
import { NavigationExtras, Router} from '@angular/router';
import { AnswerOption } from '../model/answerOption';
import { Question } from '../model/question';
import { SubmitAnswerService } from '../services/submitAnswer.service';
import { Quiz } from '../model/quiz';
import { QuizScoreService } from '../services/quiz-score.service';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})
export class QuestionComponent implements OnInit {

  private _currentQuiz: Quiz;
  currentQuestion: Question;
  answerOptionsArray: AnswerOption[];
  chosenAnswer: AnswerOption;
  submitPressed = false;

  submittedAnswer: SubmitAnswer;

  currentQuestionNumber = 0;
  errorMessage = '';
  private date: Date;
  private dateString: string;
  videoId: string;

  constructor(private quizService: QuizService,
              private submittedAnswerService: SubmitAnswerService,
              private quizScoreService: QuizScoreService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.quizService.quizSubject.subscribe(quiz => {
      this.currentQuiz = quiz;
    });
  }
  public get currentQuiz(): Quiz {
    return this._currentQuiz;
  }

  public set currentQuiz(value: Quiz) {
    this._currentQuiz = value;
    if (this._currentQuiz !== undefined && this._currentQuiz !== null){
      this.setAnswersToRadiobuttons();
    }
  }

  // hier wordt de String array"answers" geleegd in de functie,
  // vervolgens wordt de array gelijk /gematched aan de answeroption van deze vraag die uit de database zijn gehaald
  // In de forloop (HTML) wordt dan de answers gematched met dezelfde value waarde (dus antwoord A wordt radiobutton met Antwoord A)
  setAnswersToRadiobuttons() {
    this.currentQuestion = this.currentQuiz.questions.filter(question => {
      return question.id === this.currentQuestionNumber + 1;
    })[0];
//    console.log('current video id is: ' + this.currentQuestion.videoId);
    if (this.currentQuestion === undefined) {
      console.log('currentquestion is: ' + this.currentQuestion);
      this.date = new Date();
      this.dateString = formatDate(this.date, 'dd/MM/yyyy HH:mm:ss', 'en');
      this.quizScoreService.setFinishTimestamp(this.date);
      this.quizScoreService.setFinishTimestampString(this.dateString);
      this.router.navigate(['/endpage']);
      return;
    }
    this.answerOptionsArray = this.currentQuestion.answerOptions;
  }

  onFormSubmit() {
    this.submittedAnswer = {quizid: this.currentQuiz.id , chosenAnswerId: this.chosenAnswer.id , questionid: this.currentQuestion.number, answeredCorrect: false};
    this.submittedAnswerService.postSubmittedAnswer(this.submittedAnswer);
    if (this.submitPressed === false) {
      this.saveAnswers();
    }
    console.log(this.chosenAnswer);
    console.log(this.chosenAnswer.isCorrect);
    this.submitPressed = true;
  }

  // als je op knop "volgende" drukt wil je de volgende vraag laten zien
  nextQuestion() {
    this.currentQuestionNumber++;
    this.setAnswersToRadiobuttons();
    this.chosenAnswer = null;
    this.submitPressed = false;
  }

  //hier worden alle goede en foute antwoorden bijgehouden
  saveAnswers(){
    this.quizScoreService.processAnswer(this.chosenAnswer);
  }
}

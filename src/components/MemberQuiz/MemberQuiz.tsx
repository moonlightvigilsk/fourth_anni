import { useState, useMemo } from "react";
import { memberQuizQuestions } from "../../data/memberQuiz";
import { guideList } from "../../data/guides";
import styles from "./MemberQuiz.module.css";

type MemberQuizProps = {
  characterId: string;
  onComplete: () => void;
  onClose: () => void;
};

const QUESTIONS_PER_QUIZ = 3;

export const MemberQuiz = ({ characterId, onComplete, onClose }: MemberQuizProps) => {
  const character = guideList.find(g => g.id === characterId);
  const questions = useMemo(() => {
    const pool = memberQuizQuestions.filter(q => q.characterId === characterId);
    // Shuffle and pick 3
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, QUESTIONS_PER_QUIZ);
  }, [characterId]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [showResult, setShowResult] = useState(false);

  if (!character || questions.length === 0) {
    return (
      <div className={styles.container}>
        <p>Không tìm thấy câu hỏi cho nhân vật này.</p>
        <button className={styles.closeBtn} onClick={onClose}>Đóng</button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (answer: string) => {
    if (isCorrect !== null) return; // Already answered
    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.answer;
    setIsCorrect(correct);
    if (correct) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      setShowResult(true);
    }
  };

  if (showResult) {
    const passed = correctCount === QUESTIONS_PER_QUIZ;
    return (
      <div className={styles.container} style={{ "--quiz-color": character.color } as React.CSSProperties}>
        <div className={styles.resultPanel}>
          <h3>{passed ? "🎉 Hoàn thành!" : "Chưa đạt..."}</h3>
          <p className={styles.resultScore}>
            {correctCount}/{QUESTIONS_PER_QUIZ} câu đúng
          </p>
          {passed ? (
            <>
              <p>Cậu hiểu rõ về {character.name} lắm! +5 affinity</p>
              <button className={styles.primaryBtn} onClick={onComplete}>
                Nhận thưởng
              </button>
            </>
          ) : (
            <>
              <p>Hãy tìm hiểu thêm về {character.name} và thử lại nhé!</p>
              <button className={styles.primaryBtn} onClick={onClose}>
                Đóng
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container} style={{ "--quiz-color": character.color } as React.CSSProperties}>
      <div className={styles.quizHeader}>
        <h3>Quiz: {character.name}</h3>
        <span className={styles.progress}>
          {currentIndex + 1}/{questions.length}
        </span>
      </div>

      <p className={styles.question}>{currentQuestion.question}</p>

      <div className={styles.options}>
        {currentQuestion.options.map((option) => {
          let optionClass = styles.option;
          if (isCorrect !== null) {
            if (option === currentQuestion.answer) {
              optionClass += ` ${styles.correct}`;
            } else if (option === selectedAnswer && !isCorrect) {
              optionClass += ` ${styles.wrong}`;
            }
          }

          return (
            <button
              key={option}
              className={optionClass}
              onClick={() => handleAnswer(option)}
              disabled={isCorrect !== null}
            >
              {option}
            </button>
          );
        })}
      </div>

      {isCorrect !== null && (
        <div className={styles.explanation}>
          <p>{isCorrect ? "✅ Chính xác!" : "❌ Sai rồi..."}</p>
          <p className={styles.explanationText}>{currentQuestion.explanation}</p>
          <button className={styles.nextBtn} onClick={handleNext}>
            {currentIndex < questions.length - 1 ? "Câu tiếp →" : "Xem kết quả"}
          </button>
        </div>
      )}
    </div>
  );
};

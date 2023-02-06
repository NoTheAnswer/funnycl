import StarIcon from "@mui/icons-material/Star";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import classNames from "classnames";
import { SliceImage } from "components/common/SliceImage";
import { QuizFailModal } from "components/modals/QuizFailModal";
import { QuizModal } from "components/modals/QuizModal";
import {
  QuizSuccessModal,
  SuccessModalProps
} from "components/modals/QuizSuccessModal";
import { CONST } from "const";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePlay } from "store/usePlay";
import "./PlayHiddenPictureQuizItem.scss";

interface Props {
  index: number;
}

export const PlayHiddenPictureQuizItem = (props: Props) => {
  const [show, setShow] = useState<boolean>(false);
  const [successModalProps, setSuccessModalProps] = useState<SuccessModalProps>(
    { show: false }
  );
  const [showFailModal, setShowFailModal] = useState<boolean>(false);
  const [groupName, setGroupName] = useState("");

  const divRef = useRef<HTMLDivElement>(null);

  const {
    quizList,
    gameInfo,
    keyList,
    finished,
    updateGroupListScore,
    updateGroupListItem,
    updateQuizListFinished,
    updateTurn
  } = usePlay();

  const quizInfo = useMemo(() => {
    return quizList[props.index];
  }, [props.index, quizList]);

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [successModalProps.show, showFailModal]);

  useEffect(() => {
    if (show) {
      setGroupName("");
    }
  }, [show]);

  const onClick = () => {
    if (!quizInfo.finished) {
      setShow(true);
    }
  };

  const handleClose = () => {
    setShow(false);
  };

  const onSubmit = (groupName_: string, answer: string) => {
    setGroupName(groupName_);
    handleClose();
    setTimeout(() => {
      if (quizInfo.answerType === "단답형") {
        if (quizInfo.shortAnswerQuestionInfo?.answer === answer) {
          setSuccessModalProps({
            show: true,
            reward: keyList.includes(props.index) ? "KEY" : "NONE"
          });
        } else {
          setShowFailModal(true);
        }
      }
    }, 200);
  };

  const handleCloseSuccessModal = () => {
    updateQuizListFinished(props.index);
    updateGroupListScore(groupName, quizInfo.score ?? CONST.DEFAULT_SCORE);

    if (keyList.includes(props.index)) {
      updateGroupListItem(groupName, "KEY", 1);
    }

    if (gameInfo?.isTurnPlay) {
      updateTurn();
    }

    setSuccessModalProps({
      show: false
    });
  };

  const handleCloseFailModal = () => {
    if (gameInfo?.isTurnPlay) {
      updateTurn();
    }

    setShowFailModal(false);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.code === "Enter") {
      if (successModalProps.show) {
        handleCloseSuccessModal();
      }

      if (showFailModal) {
        handleCloseFailModal();
      }
    }
  };

  return (
    <>
      <div
        className={classNames("play-hidden-picture-quiz-item", {
          finished: quizInfo.finished || finished,
          "game-finished": finished
        })}
        onClick={onClick}
        ref={divRef}
      >
        <SliceImage
          className="play-hidden-picture-quiz-item__back"
          image={`${process.env.PUBLIC_URL}/img/quiz/bg_quizbox.png`}
          top={83}
          right={18}
          bottom={18}
          left={57}
          topWidth={60}
          leftWidth={43}
        />
        <span className="play-hidden-picture-quiz-item__score">
          {(props.index + 1).toString().padStart(2, " ")}
        </span>
        <img
          className="play-hidden-picture-quiz-item__question_icon"
          src={`${process.env.PUBLIC_URL}/img/quiz/icon_question.png`}
        />

        <div className="play-hidden-picture-quiz-item__star-icon">
          {Array(Math.floor(Number(quizInfo.difficulty) / 2))
            .fill(0)
            .map((_, i) => (
              <StarIcon key={`star-${i}`} />
            ))}
          {Array(quizInfo.difficulty % 2)
            .fill(0)
            .map((_, i) => (
              <StarHalfIcon key={`star-half-${i}`} />
            ))}
        </div>
        <div className="play-hidden-picture-quiz-item__subject">
          {quizInfo.subject}
          {quizInfo.keyword ? ` / ${quizInfo.keyword}` : ""}
        </div>
      </div>

      <QuizModal
        show={show}
        index={props.index}
        onSubmit={onSubmit}
        onClose={() => setShow(false)}
      />

      <QuizSuccessModal
        {...successModalProps}
        onClose={handleCloseSuccessModal}
      />

      <QuizFailModal show={showFailModal} onClose={handleCloseFailModal} />
    </>
  );
};

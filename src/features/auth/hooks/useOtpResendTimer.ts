import {
  useEffect,
  useRef,
  useState,
} from "react";


export function useResendTimer(
  initialSeconds = 60
) {

  const [secondsLeft, setSecondsLeft] =
    useState(0);


  const intervalRef =
    useRef<ReturnType<typeof setInterval> | null>(null);


  const clearTimer = () => {

    if (intervalRef.current) {

      clearInterval(intervalRef.current);

      intervalRef.current = null;
    }

  };


  const start = () => {

    clearTimer();

    setSecondsLeft(initialSeconds);

  };


  const reset = () => {

    clearTimer();

    setSecondsLeft(0);

  };


  useEffect(() => {

    if (secondsLeft <= 0) {
      return;
    }


    intervalRef.current =
      setInterval(() => {

        setSecondsLeft(prev => {

          if (prev <= 1) {

            clearTimer();

            return 0;
          }

          return prev - 1;

        });

      }, 1000);


    return clearTimer;


  }, [secondsLeft]);


  return {

    secondsLeft,

    isActive:
      secondsLeft > 0,

    start,

    reset,

  };

}
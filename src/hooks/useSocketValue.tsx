"use client";
import { useState, useEffect } from "react";

type ValueFunction<T> = () => T;

/** use useCallback to  */
function useSocketValue<T>(
  valueFunction: ValueFunction<T>,
  deps: React.DependencyList
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [socketValue, setSocketValue] = useState<T>(valueFunction());
  const [currentValue, setCurrentValue] = useState<T>(socketValue);

  useEffect(() => {
    setSocketValue(valueFunction());
  }, [valueFunction, deps]);

  useEffect(() => {
    if (socketValue) {
      setCurrentValue(socketValue);
    }
  }, [socketValue]);

  return [currentValue, setCurrentValue];
}

export default useSocketValue;

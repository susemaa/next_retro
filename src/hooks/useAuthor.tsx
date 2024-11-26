"use client";
import { useState, useEffect } from "react";
import { useActualSession } from "./useActualSession";

const useAuthor = (createdBy: string) => {
  const { data } = useActualSession();
  const [isAuthor, setIsAuthor] = useState(createdBy === data?.user?.email);

  useEffect(() => {
    setIsAuthor(createdBy === data?.user?.email);
  }, [data?.user?.email, createdBy]);

  return isAuthor;
};

export default useAuthor;

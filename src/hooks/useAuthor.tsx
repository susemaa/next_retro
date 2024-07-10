"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const useAuthor = (createdBy: string) => {
  const { data } = useSession();
  const [isAuthor, setIsAuthor] = useState(createdBy === data?.user?.email);

  useEffect(() => {
    setIsAuthor(createdBy === data?.user?.email);
  }, [data?.user?.email, createdBy]);

  return isAuthor;
};

export default useAuthor;

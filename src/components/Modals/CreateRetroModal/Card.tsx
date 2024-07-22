"use client";
import { memo } from "react";
import Image from "next/image";

interface CardProps {
  title: string;
  description: string;
	additional?: string;
  imageSrc: string;
  imageAlt: string;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ title, description, additional, imageSrc, imageAlt, onClick }) => {
  return (
    <button
      className="card card-side bg-white my-4 text-black text-left w-full"
      onClick={onClick}
    >
      <figure className="w-1/5 pl-2 select-none">
        <Image src={imageSrc} alt={imageAlt} width={100} height={100} />
      </figure>
      <div className="card-body w-4/5 p-2 select-none">
        <h2 className="card-title">{title}</h2>
        <div>
          {description}
        </div>
        {additional && (
          <div className="opacity-50">
            {additional}
          </div>
        )}
      </div>
    </button>
  );
};

export default memo(Card);

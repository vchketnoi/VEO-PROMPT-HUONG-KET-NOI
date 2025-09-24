import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="w-full max-w-4xl text-center">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
        Veo 3 Prompt By Hướng
      </h1>
      <p className="mt-4 text-lg text-dark-subtle">
        Biến kịch bản của bạn thành danh sách cảnh quay điện ảnh để tạo video bằng AI.
      </p>
    </header>
  );
};
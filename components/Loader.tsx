
import React from 'react';

const loadingMessages = [
  "Đang tham khảo ý kiến đạo diễn...",
  "Đang vẽ kịch bản phân cảnh...",
  "Đang thiết lập máy quay ảo...",
  "Đang điều chỉnh ánh sáng...",
  "Đang hoàn thiện kịch bản...",
  "Đang chuẩn bị danh sách cảnh quay cuối cùng...",
];

export const Loader: React.FC = () => {
  const [message, setMessage] = React.useState(loadingMessages[0]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMessage(prev => {
        const currentIndex = loadingMessages.indexOf(prev);
        const nextIndex = (currentIndex + 1) % loadingMessages.length;
        return loadingMessages[nextIndex];
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-8 flex flex-col items-center justify-center p-6 bg-dark-card rounded-2xl border border-dark-border">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-brand-secondary"></div>
      <p className="mt-4 text-lg font-semibold text-dark-subtle transition-opacity duration-500">{message}</p>
    </div>
  );
};
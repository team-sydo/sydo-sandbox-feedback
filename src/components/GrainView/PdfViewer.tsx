
import React from 'react';

interface PdfViewerProps {
  url: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ url }) => {
  return (
    <div className="w-full h-full flex flex-col">
      <iframe
        src={url}
        className="w-full h-full border-0"
        title="PDF Viewer"
        allowFullScreen
      />
    </div>
  );
};

export default PdfViewer;

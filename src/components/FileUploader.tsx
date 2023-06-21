import React, { useState } from "react";

type FileUploaderProps = {
  onAccepted: (files: FileList) => void;
};

const preventDefaults = (event: React.DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
};

const FileUploader = (props: FileUploaderProps) => {
  const [highlighted, setHighlighted] = useState(false);

  return (
    <div
      id="drop-area"
      className={`border-2 border-dashed rounded-2xl w-96 font-sans mx-24 my-auto p-5 ${
        highlighted ? "border-gray-900" : "border-purple-600"
      }`}
      onDragEnter={(e) => {
        preventDefaults(e);
        setHighlighted(true);
      }}
      onDragOver={(e) => {
        preventDefaults(e);
        setHighlighted(true);
      }}
      onDragLeave={(e) => {
        preventDefaults(e);
        setHighlighted(false);
      }}
      onDrop={(e) => {
        preventDefaults(e);
        setHighlighted(false);
        const files = e.dataTransfer.files;
        props.onAccepted(files);
      }}
    >
      <form className="my-form mb-3">
        <p className="mt-0">Drop file here</p>
        <input
          className="hidden"
          type="file"
          id="file-el"
          accept="text/csv"
          onChange={(e) => {
            const files = e.target.files;
            if (files != null) {
              props.onAccepted(files);
            }
          }}
        ></input>
        <label
          className="button inline-block p-2 bg-purple-500 cursor-pointer rounded-md border-2 border-solid border-purple-500 hover:bg-gray-400"
          htmlFor="file-el"
        >
          Select some files
        </label>
      </form>
    </div>
  );
};

export default FileUploader;

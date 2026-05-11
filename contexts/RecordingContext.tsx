import { Dispatch, SetStateAction, useState, createContext } from "react";

export interface IRecordingContext{
  isRecording: boolean;
  setIsRecording: Dispatch<SetStateAction<boolean>>;
  isPaused: boolean;
  setIsPaused: Dispatch<SetStateAction<boolean>>;
  recordingTime: number;
  setRecordingTime: Dispatch<SetStateAction<number>>;
}


export const RecordingContext = createContext<IRecordingContext>({
  isRecording: false,
  setIsRecording: () => {},
  isPaused: false,
  setIsPaused: () => {},
  recordingTime: 0,
  setRecordingTime: () => {}, 
});


export function RecordingContextProvider({ children }: { children: React.ReactNode }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  return (
    <RecordingContext.Provider value={{ isRecording, setIsRecording, isPaused, setIsPaused, recordingTime, setRecordingTime }}>
      {children}
    </RecordingContext.Provider>
  )
}

import { useEffect, useRef, useState } from "react";
import { MdMic } from "react-icons/md";

function App() {

  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const [isRecording, setIsRecording] = useState(false);

  const timeRef = useRef<number | null>(null);

  const RECORDING_MAX_TIME_SECONDS = 5;

  useEffect(() => {
    if (!audioStream) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        console.log("getUserMedia supported.");
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            setAudioStream(stream);
            const recorder = new MediaRecorder(stream);
            let audioData: Blob[];
            setMediaRecorder(recorder);

            recorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                audioData = [event.data];
              }
            }

            recorder.onstop = () => {
              if (audioData.length > 0) {
                const b = new Blob(audioData, { type: "audio/wav" });
                setRecordedAudioBlob(b);
                console.log("audioBlob", b);
              } else {
                console.error("No audio data captured.");
              }
            }

          })
          .catch(err => {
            console.error('Error accessing microphone:', err);
          });
      }
    }
  }, [audioStream]);

  // useEffect(() => {
  //   if (isRecording) {
  //     window.setInterval(() => {
  //       if (timeRef.current >= RECORDING_MAX_TIME_SECONDS) {
  //         stopRecording();
  //       }
  //     }, 10)
  //   }
  // }, [isRecording])

  const toggleAudioRecorder = () => {
    !isRecording && startRecording();
  }

  const startRecording = () => {
    console.log('Recording...');
    setIsRecording(true);
    setRecordingTime(0);
    setRecordedAudioBlob(null);
    mediaRecorder?.start();

    timeRef.current = window.setInterval(() => {
      setRecordingTime((prev) => {
        if (prev + 1 >= RECORDING_MAX_TIME_SECONDS) {
          stopRecording();
        }
        return prev + 1;
      })
    }, 1000)

  }

  const stopRecording = () => {
    mediaRecorder?.stop();
    setIsRecording(false);
    console.log('Stoped...');

    if (timeRef.current) {
      clearInterval(timeRef.current)
      timeRef.current = null;
    }

  }
  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h4 className="text-2xl py-10">Click the mic button to start recording!</h4>
        <MdMic onClick={toggleAudioRecorder}
          className={`border-1 
        hover:border-0 
        cursor-pointer 
        rounded-full 
        border-green-400 hover:border-green-800 
        bg-green-400 hover:bg-green-300 p-3 text-black text-6xl
        
        ${isRecording && "animate-pulse"}
        `} />
        {
          isRecording && <div className="mt-4 text-lg">
            Recording Time: {recordingTime}s / {RECORDING_MAX_TIME_SECONDS - 1}s
          </div>
        }

        {
          recordedAudioBlob && (
            <>
              <div className="mt-4 text-lg">
                <p className="p-3">Recording saved! - Preview:</p>
                <audio controls>
                  <source src={URL.createObjectURL(recordedAudioBlob)} type="audio/wav" />
                </audio>
              </div>
            </>
          )
        }
      </div>
    </>
  )
}

export default App

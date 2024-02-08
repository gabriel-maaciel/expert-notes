import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { ChangeEvent, FormEvent, useState } from 'react';
import { toast } from 'sonner';

interface NewNoteCardProps {
  onNoteCreated: (content: string) => void
}

let speechRecognition: SpeechRecognition | null = null

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [content, setContent] = useState('')

  function handleStartEditor() {
    setShouldShowOnboarding(false)
  }

  function handleContentChanged(event: ChangeEvent<HTMLTextAreaElement>) {
    setContent(event.target.value)


    if (event.target.value === '') {
      setShouldShowOnboarding(true)
    }
  }

  function handleSaveNote(event: FormEvent) {
    event.preventDefault()

    if (content === '') {
      toast.error('Note was not created, because it had no content.')
    } else {
      onNoteCreated(content)
      setContent('')
      setShouldShowOnboarding(true)
      toast.success('Note created successfully')
    }
  }

  function handleStartRecording() {

    setIsRecording(true)
    setShouldShowOnboarding(false)

    const isSpeechRecognitionAPIAvailable = 'SpeechRecognition' in window ||
      'webkitSpeechRecognition' in window

    if (!isSpeechRecognitionAPIAvailable) {
      alert('Unfortunately, your browser does not support the recording API.')
      return
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition

    speechRecognition = new SpeechRecognitionAPI()

    speechRecognition.lang = 'pt-BR'
    speechRecognition.continuous = true
    speechRecognition.maxAlternatives = 1
    speechRecognition.interimResults = true

    speechRecognition.onresult = (event) => {
      const transcription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript)
      }, '')

      setContent(transcription)
    }

    speechRecognition.onerror = (event) => {
      console.error(event)
    }

    speechRecognition.start()
  }

  function handleStopRecording() {
    setIsRecording(false)

    if (speechRecognition !== null) {
      speechRecognition.stop()
    }
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger className='rounded-md flex flex-col bg-slate-700 text-left p-5 gap-3 md:hover:ring-2 md:hover:ring-slate-600 lg:hover:ring-2 lg:hover:ring-slate-600 outline-none md:focus-visible:ring-2 md:focus-visible:ring-lime-400 lg:focus-visible:ring-2 lg:focus-visible:ring-lime-400'>
        <span className='text-sm font-medium text-slate-200'>Add note</span>
        <p className='text-sm leading-6 text-slate-400'>Record an audio note that will be converted to text automatically.</p>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className='inset-0 fixed bg-black/50' />
        <Dialog.Content className='fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:max-w-[640px] md:h-[58vh] lg:w-full bg-slate-700 md:rounded-md flex flex-col outline-none'>

          <Dialog.Close className='absolute right-0 top-0 bg-slate-800 md:rounded-md p-1 outline-none text-slate-400 hover:text-slate-100'>
            <X size={20} />
          </Dialog.Close>

          <form className='flex-1 flex flex-col'>
            <div className='flex flex-1 flex-col gap-3 p-5'>
              <span className='text-sm font-medium text-slate-300'>
                Add note
              </span>

              {shouldShowOnboarding ? (
                <p className='text-sm leading-6 text-slate-400'>
                  Start by <button type='button' onClick={handleStartRecording} className='text-lime-300 font-medium hover:underline'>recording an audio note </button> or if you prefer  <button type='button' onClick={handleStartEditor} className='text-lime-300 font-medium hover:underline'> just use text. </button>
                </p>
              ) : (
                <textarea
                  autoFocus
                  className='text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none'
                  onChange={handleContentChanged}
                  value={content}
                />
              )}
            </div>

            {isRecording ? (
              <button
                type='button'
                onClick={handleStopRecording}
                className='w-full flex items-center justify-center gap-2 bg-slate-800 py-2 text-center text-sm text-slate-300 outline-none font-bold hover:text-slate-100'
              >
                <div className='h-2 w-2 rounded-full bg-red-400 animate-pulse' />
                Recording (Click to stop)

              </button>
            ) : (
              <button
                type='button'
                onClick={handleSaveNote}
                className='w-full bg-lime-300 py-2 text-center text-sm text-slate-900 outline-none font-bold hover:bg-lime-400'
              >
                Save note
              </button>
            )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
import { useState, useCallback, useEffect, useRef } from 'react';
import { useRive, useStateMachineInput } from '@rive-app/react-canvas';
import { Howl } from 'howler';
import type { BookDetail, BookPage } from '@/types/books';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BookReaderProps {
  book: BookDetail;
  onClose: () => void;
  onProgress?: (page: number, totalPages: number) => void;
}

export function BookReader({ book, onClose, onProgress }: BookReaderProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isNarrating, setIsNarrating] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const soundRef = useRef<Howl | null>(null);
  const { t } = useTranslation();

  const currentPage = book.pages[currentPageIndex];
  const totalPages = book.pages.length;

  // Report progress
  useEffect(() => {
    onProgress?.(currentPageIndex + 1, totalPages);
  }, [currentPageIndex, totalPages, onProgress]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      soundRef.current?.unload();
    };
  }, []);

  const playNarration = useCallback((page: BookPage) => {
    soundRef.current?.unload();

    if (!page.narrationAudioUrl) return;

    const sound = new Howl({
      src: [page.narrationAudioUrl],
      html5: true,
      volume: isMuted ? 0 : 1,
      onplay: () => setIsNarrating(true),
      onend: () => setIsNarrating(false),
      onstop: () => setIsNarrating(false),
    });

    soundRef.current = sound;
    sound.play();
  }, [isMuted]);

  const stopNarration = useCallback(() => {
    soundRef.current?.stop();
    setIsNarrating(false);
  }, []);

  const goToPage = useCallback((index: number) => {
    if (index >= 0 && index < totalPages) {
      stopNarration();
      setCurrentPageIndex(index);
    }
  }, [totalPages, stopNarration]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newVal = !prev;
      if (soundRef.current) {
        soundRef.current.volume(newVal ? 0 : 1);
      }
      return newVal;
    });
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') goToPage(currentPageIndex + 1);
      if (e.key === 'ArrowLeft') goToPage(currentPageIndex - 1);
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentPageIndex, goToPage, onClose]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/80 text-white">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="h-5 w-5" />
          </Button>
          <span className="font-medium">{book.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/70">
            {t('library.page', { current: currentPageIndex + 1, total: totalPages })}
          </span>
          <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:bg-white/20">
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {currentPage ? (
          <PageRenderer
            key={currentPage.id}
            page={currentPage}
            onNarrate={() => playNarration(currentPage)}
            isNarrating={isNarrating}
          />
        ) : (
          <div className="text-white text-xl">{t('library.noPagesAvailable')}</div>
        )}

        {/* Navigation arrows */}
        {currentPageIndex > 0 && (
          <button
            onClick={() => goToPage(currentPageIndex - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
        )}
        {currentPageIndex < totalPages - 1 && (
          <button
            onClick={() => goToPage(currentPageIndex + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        )}
      </div>

      {/* Bottom bar - narration text */}
      {currentPage?.narrationText && (
        <div className="px-8 py-4 bg-black/80 text-center">
          <p className="text-white text-lg leading-relaxed max-w-2xl mx-auto">
            {currentPage.narrationText}
          </p>
          {currentPage.narrationAudioUrl && !isNarrating && (
            <Button
              variant="secondary"
              size="sm"
              className="mt-2"
              onClick={() => playNarration(currentPage)}
            >
              <Volume2 className="mr-2 h-4 w-4" /> {t('library.listen')}
            </Button>
          )}
        </div>
      )}

      {/* Page progress dots */}
      <div className="flex justify-center gap-1.5 py-3 bg-black/80">
        {book.pages.map((_, i) => (
          <button
            key={i}
            onClick={() => goToPage(i)}
            className={`h-2 rounded-full transition-all ${
              i === currentPageIndex
                ? 'w-6 bg-white'
                : i < currentPageIndex
                ? 'w-2 bg-white/60'
                : 'w-2 bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function PageRenderer({
  page,
  onNarrate,
  isNarrating,
}: {
  page: BookPage;
  onNarrate: () => void;
  isNarrating: boolean;
}) {
  // If there's a Rive file, render it
  if (page.riveFileUrl) {
    return (
      <RivePageRenderer
        riveFileUrl={page.riveFileUrl}
        stateMachine={page.stateMachine}
        artboard={page.artboard}
        isNarrating={isNarrating}
        onNarrate={onNarrate}
      />
    );
  }

  // Fallback: text-only page
  return (
    <div className="flex flex-col items-center justify-center p-8 max-w-2xl">
      <div className="bg-white/5 rounded-2xl p-12 w-full aspect-[4/3] flex items-center justify-center">
        <p className="text-white/80 text-2xl text-center leading-relaxed">
          {page.narrationText || `Page ${page.pageNumber}`}
        </p>
      </div>
    </div>
  );
}

function RivePageRenderer({
  riveFileUrl,
  stateMachine,
  artboard,
  isNarrating,
  onNarrate,
}: {
  riveFileUrl: string;
  stateMachine?: string;
  artboard?: string;
  isNarrating: boolean;
  onNarrate: () => void;
}) {
  const { RiveComponent, rive } = useRive({
    src: riveFileUrl,
    stateMachines: stateMachine || 'PageController',
    artboard: artboard,
    autoplay: true,
  });

  // Connect narration state to Rive input
  const isNarratingInput = useStateMachineInput(
    rive,
    stateMachine || 'PageController',
    'isNarrating'
  );

  useEffect(() => {
    if (isNarratingInput) {
      isNarratingInput.value = isNarrating;
    }
  }, [isNarrating, isNarratingInput]);

  return (
    <div
      className="w-full h-full max-w-4xl max-h-[80vh] aspect-[4/3] cursor-pointer"
      onClick={onNarrate}
    >
      <RiveComponent />
    </div>
  );
}

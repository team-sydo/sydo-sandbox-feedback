
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Flag, Pencil, X } from 'lucide-react';
import { fabric } from 'fabric';
import { Textarea } from '@/components/ui/textarea';

interface ImageAnnotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File | null;
  onSubmit: (content: string, annotatedImageUrl: string) => void;
  timecode?: number | null;
  initialContent?: string; // Add initialContent prop
}

type AnnotationTool = 'select' | 'marker' | 'draw' | null;

const ImageAnnotationModal: React.FC<ImageAnnotationModalProps> = ({
  isOpen,
  onClose,
  imageFile,
  onSubmit,
  timecode,
  initialContent = '' // Default to empty string
}) => {
  const [content, setContent] = useState('');
  const [activeTool, setActiveTool] = useState<AnnotationTool>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize content with initialContent when modal opens
  useEffect(() => {
    if (isOpen && initialContent) {
      setContent(initialContent);
    }
  }, [isOpen, initialContent]);

  // Load image preview when file changes
  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(imageFile);
    } else {
      setImagePreview(null);
    }
  }, [imageFile]);

  // Initialize fabric canvas when modal opens
  useEffect(() => {
    if (isOpen && imagePreview && canvasElRef.current) {
      // Initialize canvas
      if (!canvasRef.current) {
        canvasRef.current = new fabric.Canvas(canvasElRef.current, {
          width: 800,
          height: 600,
          backgroundColor: '#e5e5e5',
        });
      }

      // Load image onto canvas
      fabric.Image.fromURL(imagePreview, (img) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Calculate scaling to fit the canvas
        const canvasWidth = canvas.width || 800;
        const canvasHeight = canvas.height || 600;
        
        const scale = Math.min(
          canvasWidth / img.width!,
          canvasHeight / img.height!
        );

        img.scale(scale);
        
        // Center the image
        img.set({
          left: (canvasWidth - img.width! * scale) / 2,
          top: (canvasHeight - img.height! * scale) / 2,
          selectable: false,
          evented: false,
        });

        canvas.clear();
        canvas.add(img);
        canvas.renderAll();
      });

      return () => {
        // Cleanup
        if (canvasRef.current) {
          canvasRef.current.dispose();
          canvasRef.current = null;
        }
      };
    }
  }, [isOpen, imagePreview]);

  // Handle tool selection
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Reset selection and drawing mode
    canvas.isDrawingMode = false;
    canvas.selection = activeTool === 'select';

    // Configure drawing brush
    if (activeTool === 'draw') {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.color = '#ff0000';
      canvas.freeDrawingBrush.width = 3;
    }

    // Handle marker tool with click events
    const handleCanvasClick = (e: fabric.IEvent) => {
      if (activeTool === 'marker' && e.pointer) {
        const markerSize = 20;
        const marker = new fabric.Triangle({
          left: e.pointer.x - markerSize/2,
          top: e.pointer.y - markerSize,
          width: markerSize,
          height: markerSize,
          fill: '#f44336',
          objectCaching: false,
          selectable: true,
          transparentCorners: false,
        });
        canvas.add(marker);
        canvas.renderAll();
      }
    };

    canvas.on('mouse:down', handleCanvasClick);

    return () => {
      canvas.off('mouse:down', handleCanvasClick);
    };
  }, [activeTool]);

  // Handle delete selected objects with delete key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const canvas = canvasRef.current;
        if (canvas && canvas.getActiveObjects().length > 0) {
          canvas.getActiveObjects().forEach(obj => {
            canvas.remove(obj);
          });
          canvas.discardActiveObject();
          canvas.renderAll();
        }
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSubmit = () => {
    if (!canvasRef.current) return;

    // Convert canvas to image URL
    const annotatedImageUrl = canvasRef.current.toDataURL({
      format: 'png',
      quality: 0.8
    });

    onSubmit(content, annotatedImageUrl);
    handleClose();
  };

  const handleClose = () => {
    setContent('');
    setActiveTool(null);
    setImagePreview(null);
    onClose();
  };

  const isToolActive = (tool: AnnotationTool) => activeTool === tool;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl p-0 gap-0 h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">nouveau commentaire</h2>
          {timecode !== null && timecode !== undefined && (
            <div className="text-sm text-gray-500">
              Timecode: {Math.floor(timecode / 60)}:{(timecode % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center relative">
          <canvas ref={canvasElRef} className="" id="canvas"/>
          {!imagePreview && (
            <div className=" inset-0 flex items-center justify-center text-4xl font-bold text-gray-400">
              Capture de l'iframe
            </div>
          )}
        </div>
        
        <div className="p-4 border-t">
          <div className="mb-4">
            <div className="text-sm font-medium mb-2">commentaire</div>
            <Textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ajouter un commentaire..."
              className="min-h-[80px]"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={isToolActive('draw') ? "default" : "outline"}
                onClick={() => setActiveTool(isToolActive('draw') ? null : 'draw')}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Ajout tracé
              </Button>
              
              <Button
                type="button"
                variant={isToolActive('marker') ? "default" : "outline"}
                onClick={() => setActiveTool(isToolActive('marker') ? null : 'marker')}
              >
                <Flag className="h-4 w-4 mr-2" />
                Ajout Marqueur
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Retour
              </Button>
              
              <Button
                type="submit"
                disabled={!content.trim()}
                onClick={handleSubmit}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Publier
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageAnnotationModal;

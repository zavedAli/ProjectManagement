import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../../api/task.api';
import { queryKeys } from '../../queryKeys';

interface TaskAttachmentsProps {
  taskId: string;
  attachments?: any[];
}

export const TaskAttachments = ({ taskId, attachments = [] }: TaskAttachmentsProps) => {
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => taskApi.uploadAttachment(taskId, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tasks.detail(taskId) });
      qc.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (attachmentId: string) => taskApi.deleteAttachment(attachmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tasks.detail(taskId) });
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadMutation.mutateAsync(file);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isImage = (mimeType: string) => mimeType.startsWith('image/');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Attachments ({attachments.length})</h4>
        <label className="px-3 py-1 bg-blue-600 text-white text-sm rounded cursor-pointer hover:bg-blue-700">
          {uploading ? 'Uploading...' : 'Upload File'}
          <input
            type="file"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      <div className="space-y-2">
        {attachments.map((att) => (
          <div key={att.id} className="p-3 bg-gray-50 rounded-md">
            {isImage(att.mimeType) && (
              <div className="mb-2">
                <img src={att.url} alt={att.filename} className="max-w-full h-auto rounded max-h-64 object-contain" />
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  {att.filename}
                </a>
                <p className="text-xs text-gray-500">{formatFileSize(att.size)}</p>
              </div>
              <button
                onClick={() => deleteMutation.mutate(att.id)}
                className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {attachments.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">No attachments yet</p>
        )}
      </div>
    </div>
  );
};

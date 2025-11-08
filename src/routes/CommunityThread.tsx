import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getThread, getThreadReplies, getUser } from '../lib/api';
import { mergeRepliesWithOverlay, mergeThreadsWithOverlay, createReply, lockThread, deleteThread } from '../lib/localSim';
import { getSession } from '../lib/authSim';
import { formatDateTime } from '../lib/utils';
import ReplyForm from '../components/ReplyForm';
import type { ReplyInput } from '../types/models';
import { useState } from 'react';

export default function CommunityThread() {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const session = getSession();
  const isAdmin = session?.role === 'Admin';
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: thread, isLoading: threadLoading, refetch: refetchThread } = useQuery({
    queryKey: ['thread', threadId],
    queryFn: async () => {
      if (!threadId) return null;
      try {
        const baseThread = await getThread(threadId);
        if (!baseThread) return null;
        
        // Apply overlay to get updates like isLocked
        const merged = mergeThreadsWithOverlay([baseThread]);
        const result = merged.length > 0 ? merged[0] : baseThread;
        
        // Ensure isLocked exists (default to false if not present)
        return {
          ...result,
          isLocked: result.isLocked ?? false,
        };
      } catch (error) {
        console.error('Error fetching thread:', error);
        return null;
      }
    },
    enabled: !!threadId,
  });

  const { data: replies = [], isLoading: repliesLoading, refetch } = useQuery({
    queryKey: ['replies', threadId],
    queryFn: async () => {
      if (!threadId) return [];
      const baseReplies = await getThreadReplies(threadId);
      return mergeRepliesWithOverlay(baseReplies);
    },
    enabled: !!threadId,
  });

  const { data: threadAuthor } = useQuery({
    queryKey: ['user', thread?.createdByUserId],
    queryFn: () => getUser(thread!.createdByUserId),
    enabled: !!thread?.createdByUserId,
  });

  const handleCreateReply = (input: ReplyInput) => {
    createReply(input);
    refetch();
  };

  // Lock/unlock mutation
  const lockMutation = useMutation({
    mutationFn: async (isLocked: boolean) => {
      if (!threadId) throw new Error('Thread ID required');
      lockThread(threadId, isLocked);
    },
    onSuccess: () => {
      refetchThread();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!threadId) throw new Error('Thread ID required');
      deleteThread(threadId);
    },
    onSuccess: () => {
      navigate('/community');
    },
  });

  const handleToggleLock = () => {
    if (thread) {
      lockMutation.mutate(!thread.isLocked);
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  if (threadLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading...</p>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card p-8 text-center">
          <p className="text-gray-600">Thread not found.</p>
          <Link to="/community" className="text-primary-600 mt-4 inline-block">
            Back to Community
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Link
          to="/community"
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          ← Back to Community
        </Link>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{thread.title}</h1>
          </div>
          <div className="flex items-center gap-2 ml-4">
            {thread.isPinned && (
              <span className="badge bg-primary-100 text-primary-800">Pinned</span>
            )}
            {thread.isLocked && (
              <span className="badge bg-amber-100 text-amber-800">🔒 Locked</span>
            )}
          </div>
        </div>

        <div className="prose max-w-none text-gray-700 mb-4">
          {thread.bodyMarkdown.split('\n').map((para, i) => (
            <p key={i} className="mb-2">
              {para}
            </p>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Posted by {threadAuthor?.name || 'Unknown'} •{' '}
            {formatDateTime(thread.createdAt)}
          </div>

          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={handleToggleLock}
                className="btn btn-sm bg-amber-100 text-amber-800 hover:bg-amber-200"
                disabled={lockMutation.isPending}
              >
                {lockMutation.isPending ? '...' : thread.isLocked ? '🔓 Unlock' : '🔒 Lock'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn btn-sm bg-red-100 text-red-800 hover:bg-red-200"
              >
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Replies ({replies.length})
        </h2>

        {repliesLoading ? (
          <p className="text-gray-500">Loading replies...</p>
        ) : replies.length === 0 ? (
          <p className="text-gray-600">No replies yet. Be the first to reply!</p>
        ) : (
          <div className="space-y-4">
            {replies.map((reply) => (
              <ReplyCard key={reply.id} reply={reply} />
            ))}
          </div>
        )}
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Reply</h3>
        {thread.isLocked ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
            <p className="text-amber-800">🔒 This thread is locked. No new replies can be added.</p>
          </div>
        ) : (
          <ReplyForm onSubmit={handleCreateReply} threadId={thread.id} />
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Thread?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this thread? This action cannot be undone.
              All replies will also be inaccessible.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn bg-gray-200 text-gray-700 hover:bg-gray-300"
                disabled={deleteMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn bg-red-600 text-white hover:bg-red-700"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Thread'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReplyCard({ reply }: { reply: any }) {
  const { data: author } = useQuery({
    queryKey: ['user', reply.createdByUserId],
    queryFn: () => getUser(reply.createdByUserId),
  });

  return (
    <div className="card p-4">
      <div className="prose max-w-none text-gray-700 mb-3">
        {reply.bodyMarkdown.split('\n').map((para: string, i: number) => (
          <p key={i} className="mb-1">
            {para}
          </p>
        ))}
      </div>
      <div className="text-xs text-gray-500">
        {author?.name || 'Unknown'} • {formatDateTime(reply.createdAt)}
      </div>
    </div>
  );
}

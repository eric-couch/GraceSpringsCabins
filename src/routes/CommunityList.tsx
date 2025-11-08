import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getThreads } from '../lib/api';
import { mergeThreadsWithOverlay, createThread } from '../lib/localSim';
import { getCurrentPropertyId } from '../lib/authSim';
import { getRelativeTime } from '../lib/utils';
import ThreadForm from '../components/ThreadForm';
import EmptyState from '../components/EmptyState';
import type { ThreadInput } from '../types/models';

export default function CommunityList() {
  const [showNewThread, setShowNewThread] = useState(false);
  const propertyId = getCurrentPropertyId();

  const { data: threads = [], isLoading, refetch } = useQuery({
    queryKey: ['threads', propertyId],
    queryFn: async () => {
      if (!propertyId) return [];
      const baseThreads = await getThreads(propertyId);
      return mergeThreadsWithOverlay(baseThreads);
    },
    enabled: !!propertyId,
  });

  const handleCreateThread = (input: ThreadInput) => {
    createThread(input);
    setShowNewThread(false);
    refetch();
  };

  const pinnedThreads = threads.filter((t) => t.isPinned);
  const regularThreads = threads.filter((t) => !t.isPinned).sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Community Board
          </h1>
          <p className="text-gray-600">Connect with your neighbors.</p>
        </div>
        <button
          onClick={() => setShowNewThread(!showNewThread)}
          className="btn-primary"
        >
          {showNewThread ? 'Cancel' : '+ New Thread'}
        </button>
      </div>

      {showNewThread && propertyId && (
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Create New Thread</h2>
          <ThreadForm
            onSubmit={handleCreateThread}
            propertyId={propertyId}
            onCancel={() => setShowNewThread(false)}
          />
        </div>
      )}

      {threads.length === 0 ? (
        <EmptyState
          title="No Threads Yet"
          description="Be the first to start a conversation in the community."
          actionLabel="Create First Thread"
          onAction={() => setShowNewThread(true)}
        />
      ) : (
        <div className="space-y-4">
          {pinnedThreads.length > 0 && (
            <div className="space-y-3">
              {pinnedThreads.map((thread) => (
                <Link
                  key={thread.id}
                  to={`/community/${thread.id}`}
                  className="card p-5 block hover:shadow-md transition border-l-4 border-primary-500"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {thread.title}
                    </h3>
                    <div className="flex gap-2">
                      <span className="badge bg-primary-100 text-primary-800">
                        Pinned
                      </span>
                      {thread.isLocked && (
                        <span className="badge bg-amber-100 text-amber-800">
                          🔒 Locked
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                    {thread.bodyMarkdown.split('\n')[0]}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getRelativeTime(thread.createdAt)}
                  </p>
                </Link>
              ))}
            </div>
          )}

          {regularThreads.length > 0 && (
            <div className="space-y-3">
              {regularThreads.map((thread) => (
                <Link
                  key={thread.id}
                  to={`/community/${thread.id}`}
                  className="card p-5 block hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {thread.title}
                    </h3>
                    {thread.isLocked && (
                      <span className="badge bg-amber-100 text-amber-800">
                        🔒 Locked
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                    {thread.bodyMarkdown.split('\n')[0]}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getRelativeTime(thread.updatedAt)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

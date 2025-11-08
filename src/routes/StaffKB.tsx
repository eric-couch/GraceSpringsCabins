import { useQuery } from '@tanstack/react-query';
import { getKBArticlesByProperty } from '../lib/api';
import { getCurrentPropertyId } from '../lib/authSim';

export default function StaffKB() {
  const propertyId = getCurrentPropertyId();

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['kbArticles', propertyId],
    queryFn: async () => {
      if (!propertyId) return [];
      return getKBArticlesByProperty(propertyId);
    },
    enabled: !!propertyId,
  });

  if (isLoading) return <div className="container mx-auto px-4 py-8"><p>Loading...</p></div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Knowledge Base</h1>

      <div className="grid gap-6">
        {articles.map((article) => (
          <div key={article.id} className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {article.title}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              <strong>Symptoms:</strong> {article.symptoms}
            </p>
            <div className="prose max-w-none text-gray-700 mb-4">
              <div dangerouslySetInnerHTML={{ __html: article.stepsMarkdown.replace(/\n/g, '<br />') }} />
            </div>
            <div className="flex items-center gap-2">
              {article.tags.map((tag) => (
                <span key={tag} className="badge bg-gray-100 text-gray-700">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

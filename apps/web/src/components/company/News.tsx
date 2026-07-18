import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Newspaper, Award, TrendingUp, Globe } from 'lucide-react';
import NewsletterSubscription from '@/components/news/NewsletterSubscription';

interface NewsItem {
  title: string;
  date: string;
  category: string;
  summary: string;
  icon: React.ReactNode;
}

const newsItems: NewsItem[] = [
  {
    title: 'GoodsHandler Expands International Network',
    date: '2024-02-15',
    category: 'Company News',
    summary: 'GoodsHandler announces expansion of its international shipping network to 20 new countries, enhancing global delivery capabilities.',
    icon: <Globe className="h-6 w-6 text-brand" />
  },
  {
    title: 'Awarded Best Logistics Provider 2024',
    date: '2024-01-30',
    category: 'Awards',
    summary: 'GoodsHandler recognized as the leading logistics provider for excellence in service quality and customer satisfaction.',
    icon: <Award className="h-6 w-6 text-brand" />
  },
  {
    title: 'Q4 2023 Growth Exceeds Expectations',
    date: '2024-01-15',
    category: 'Financial News',
    summary: 'Company reports strong Q4 performance with 25% year-over-year growth in shipping volume and market expansion.',
    icon: <TrendingUp className="h-6 w-6 text-brand" />
  },
];

const News = () => {
  return (
    <MainLayout>
      <div className="logistics-container py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-gray-900">News & Press</h1>
            <Button variant="outline" className="border-brand text-brand hover:bg-brand-50">
              <Newspaper className="h-5 w-5 mr-2" />
              Press Kit
            </Button>
          </div>

          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-xl text-gray-600">
              Stay updated with the latest news, achievements, and developments at GoodsHandler.
            </p>
          </div>

          <div className="space-y-8">
            {newsItems.map((item, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start">
                  <div className="mr-4 mt-1">{item.icon}</div>
                  <div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                      <span>{item.category}</span>
                      <span>•</span>
                      <span>{new Date(item.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h2>
                    <p className="text-gray-600">{item.summary}</p>
                    <Button variant="link" className="text-brand hover:text-brand-600 p-0 mt-2">
                      Read More →
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <NewsletterSubscription />

          <div className="mt-12 bg-gray-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Media Inquiries</h2>
            <p className="text-gray-600 mb-6">
              For press inquiries, interview requests, or additional information about GoodsHandler,
              please contact our media relations team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-brand hover:bg-brand-600">
                Contact Media Relations
              </Button>
              <Button variant="outline" className="border-brand text-brand hover:bg-brand-50">
                Download Media Assets
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default News;
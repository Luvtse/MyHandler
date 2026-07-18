
import React from 'react';
import { Star } from 'lucide-react';

interface TestimonialProps {
  quote: string;
  author: string;
  company: string;
  image: string;
}

const Testimonial = ({ quote, author, company, image }: TestimonialProps) => {
  return (
    <div className="flex flex-col h-full rounded-2xl bg-white p-8 border border-gray-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/5">
      <div className="mb-4 flex gap-1" aria-label="Rated 5 out of 5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-5 w-5 fill-brand-yellow text-brand-yellow" />
        ))}
      </div>
      <p className="text-gray-700 leading-relaxed flex-grow text-pretty">&ldquo;{quote}&rdquo;</p>

      <div className="mt-6 flex items-center border-t border-gray-100 pt-5">
        <img
          src={image}
          alt={author}
          className="h-12 w-12 rounded-full mr-4 object-cover ring-2 ring-brand-50"
        />
        <div>
          <p className="font-semibold text-gray-900">{author}</p>
          <p className="text-gray-500 text-sm">{company}</p>
        </div>
      </div>
    </div>
  );
};

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-brand-50">
      <div className="logistics-container">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <span className="badge-blue mb-4 inline-block">Testimonials</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-balance">What our customers say</h2>
          <p className="text-gray-500 mt-4 text-lg text-pretty">
            Don&apos;t just take our word for it. Here&apos;s what our customers have to say about our services.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Testimonial 
            quote="GoodsHandler has transformed how we handle our shipping needs. Their tracking system is incredibly reliable, and deliveries are always on time."
            author="Sarah Johnson"
            company="Fashion Retailer"
            image="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Nnx8d29tYW4lMjBwb3J0cmFpdHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=900&q=60"
          />
          
          <Testimonial 
            quote="We've been using GoodsHandler for our international shipments for over two years now. Their customs expertise has saved us countless headaches."
            author="Michael Chen"
            company="Tech Innovations Inc."
            image="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OXx8YnVzaW5lc3MlMjBtYW58ZW58MHx8MHx8&auto=format&fit=crop&w=900&q=60"
          />
          
          <Testimonial 
            quote="The customer service at GoodsHandler is exceptional. When we had a delivery emergency, they went above and beyond to ensure our package arrived on time."
            author="Emma Rodriguez"
            company="Medical Supplies Co."
            image="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8&auto=format&fit=crop&w=900&q=60"
          />
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;


import React from 'react';

interface TestimonialProps {
  quote: string;
  author: string;
  company: string;
  image: string;
}

const Testimonial = ({ quote, author, company, image }: TestimonialProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-start mb-4">
        <svg className="h-10 w-10 text-brand-300 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 32 32">
          <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
        </svg>
        <p className="text-gray-700 italic">{quote}</p>
      </div>
      
      <div className="flex items-center">
        <img 
          src={image} 
          alt={author} 
          className="h-12 w-12 rounded-full mr-4 object-cover" 
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
    <section className="py-16 bg-brand-50">
      <div className="logistics-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">What Our Customers Say</h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our customers have to say about our services.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

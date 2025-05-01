
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-16">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-100 to-white z-0"></div>
      <div className="container-custom relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          <div className="lg:w-1/2 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in-up">
              <span className="block">Fresh Clothes.</span>
              <span className="block text-blue">Fast Service.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0 animate-[fade-in-up_0.5s_ease-out_0.2s_both]">
              Premium laundry services tailored to fit your busy lifestyle. We clean, iron, and deliver – so you don't have to.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-[fade-in-up_0.5s_ease-out_0.4s_both]">
              <Button className="btn-primary text-base px-8 py-6 transition-transform hover:scale-105">Get Started</Button>
              <Button variant="outline" className="text-base px-8 py-6 transition-transform hover:scale-105">
                View Services
              </Button>
            </div>
          </div>
          <div className="lg:w-1/2 flex justify-center lg:justify-end mt-8 lg:mt-0 animate-[fade-in-up_0.5s_ease-out_0.3s_both]">
            <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
              <div className="absolute inset-0 bg-blue rounded-full opacity-10 animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src="/lovable-uploads/198fd8c7-14bf-4b95-bca5-dce17b20b362.png"
                  alt="VK Wash Logo"
                  className="w-3/4 h-3/4 object-contain transition-all duration-300 hover:scale-110 filter hover:brightness-110"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-16 lg:mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {[
            { count: '5+', label: 'Years Experience' },
            { count: '1000+', label: 'Happy Customers' },
            { count: '24h', label: 'Fast Turnaround' },
            { count: '100%', label: 'Satisfaction' }
          ].map((stat, index) => (
            <div 
              key={index} 
              className="text-center p-4 rounded-lg bg-white shadow-sm card-hover transform transition-all duration-300 hover:-translate-y-2 hover:shadow-md"
              style={{ animationDelay: `${index * 0.1 + 0.5}s` }}
            >
              <div className="text-3xl font-bold text-blue mb-2">{stat.count}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;

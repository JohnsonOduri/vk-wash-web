import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { name, email, phone, message } = formData;
    const whatsappMessage = `Hello, my name is ${name} Email: ${email} Phone: ${phone} Message: ${message}`;
    const whatsappUrl = `https://wa.me/918106549413?text=${whatsappMessage}`;

    window.location.href = whatsappUrl;
  };

  return (
    <section id="contact" className="section-padding bg-white">
      <div className="container-custom">
        <h2 className="section-title">Contact Us</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Have questions about our services? Need a custom quote? Get in touch with our team, and we'll get back to you as soon as possible.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-16">
          <div className="lg:col-span-2">
            <div className="bg-gray-50 p-6 rounded-lg h-full">
              <h3 className="text-2xl font-bold mb-6">Get In Touch</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold mb-2">Our Location</h4>
                  <p className="text-gray-600">
                    Vattinagulapally, Gandipet<br />
                    Hyderabad, 500075, Telangana, India
                    
                  </p>
                </div>
                
                <div>
                  <h4 className="font-bold mb-2">Contact Information</h4>
                  <p className="text-gray-600">
                    Email: vkwashexpress@gmail.com<br />
                    Phone: +91 81065 49413, +91 81438 46341<br />
                  </p>
                </div>
                
                <div>
                  <h4 className="font-bold mb-2">Business Hours</h4>
                  <p className="text-gray-600">
                    Monday - Friday: 8:00 AM - 8:00 PM<br />
                    Saturday and Sunday : 9:00 AM - 6:00 PM<br />
                    
                  </p>
                </div>
              </div>
              
              <div className="mt-8">
                <h4 className="font-bold mb-4">Get Connected</h4>
                <div className="flex space-x-4">
                  {['Whatsapp'].map(social => (
                    <a 
                      key={social}
                      href={`https://wa.me/918106549413`}
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="w-10 h-10 rounded-full bg-blue bg-opacity-10 flex items-center justify-center text-blue hover:bg-opacity-20 transition-colors"
                    >
                      <img 
                        src="src/components/pictures/Whatsapp.jpg" 
                        alt="WhatsApp" 
                        className="w-6 h-6"
                      />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block font-medium">
                    Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="block font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your Email"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="phone" className="block font-medium">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Your Phone Number"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="message" className="block font-medium">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  rows={5}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="btn-primary w-full md:w-auto px-8"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

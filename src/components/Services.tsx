
import { motion } from "framer-motion";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter,
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Import images
import basicWash from "./pictures/basic-wash.jpg";
import premiumWash from "./pictures/premium-wash.jpg";
import expressServices from "./pictures/express-services.jpg";
import dryCleaning from "./pictures/dryCleaning.jpg";
import ironing from "./pictures/ironing.jpg";
import washing from "./pictures/washing.jpg";

const floatAnimation = {
  initial: { y: 0 },
  animate: { 
    y: [-10, 10, -10],
    transition: {
      repeat: Infinity,
      duration: 6,
      ease: "easeInOut"
    }
  }
};

const pulseAnimation = {
  initial: { scale: 1 },
  animate: { 
    scale: [1, 1.05, 1],
    transition: {
      repeat: Infinity,
      duration: 4,
      ease: "easeInOut"
    }
  }
};

const fadeInAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6
    }
  }
};

const Services = () => {
  const services = [
    {
      title: "Basic Wash",
      description: "Our standard washing service",
      image: basicWash,
      alt: "Basic Wash",
      animation: floatAnimation,
    },
    {
      title: "Premium Wash",
      description: "Premium treatment for your clothes",
      image: premiumWash,
      alt: "Premium Wash",
      animation: pulseAnimation,
    },
    {
      title: "Express Services",
      description: "Quick turnaround for urgent needs",
      image: expressServices,
      alt: "Express Services",
      animation: floatAnimation,
    },
    {
      title: "Dry Cleaning",
      description: "Professional dry cleaning",
      image: dryCleaning,
      alt: "Dry Cleaning",
      animation: pulseAnimation,
    },
    {
      title: "Ironing",
      description: "Professional ironing services",
      image: ironing,
      alt: "Ironing",
      animation: floatAnimation,
    },
    {
      title: "Washing",
      description: "Quality washing for all fabrics",
      image: washing,
      alt: "Washing",
      animation: pulseAnimation,
    },
  ];

  return (
    <section id="services" className="bg-gray-50 py-20">
      <div className="container-custom">
        <motion.div 
          initial="initial" 
          whileInView="animate" 
          viewport={{ once: true }}
          variants={fadeInAnimation}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Our Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            VK Wash offers a wide range of laundry services to meet your needs.
            From basic washing to premium care for your delicate fabrics.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              variants={service.animation}
              className="h-full"
            >
              <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg">
                <div className="w-full h-48 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.alt}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
                <CardHeader>
                  <CardTitle>{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Professional care for your garments with attention to every detail.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Learn More</Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;

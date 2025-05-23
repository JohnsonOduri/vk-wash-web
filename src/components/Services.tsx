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
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useState } from "react";
import dryCleaningImg from './pictures/dryCleaning.png';
import ironingImg from './pictures/ironing.png';
import washingImg from './pictures/washing.png';

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
      title: "Dry Cleaning",
      description: "Professional dry cleaning",
      image: dryCleaningImg,
      alt: "Dry Cleaning",
      animation: pulseAnimation,
      details: [
        "Specialized solvent cleaning for delicate items",
        "Spot treatment for stubborn stains",
        "Safe process for wool, silk, and synthetics",
        "Pressing and steaming for wrinkle removal",
        "Protective packaging to maintain shape"
      ]
    },
    {
      title: "Ironing",
      description: "Professional ironing services",
      image: ironingImg,
      alt: "Ironing",
      animation: floatAnimation,
      details: [
        "Temperature-appropriate ironing for all fabrics",
        "Steam treatment for stubborn wrinkles",
        "Perfect creases for formal attire",
        "Special attention to collars and cuffs",
        "Careful hanging to prevent new wrinkles"
      ]
    },
    {
      title: "Washing",
      description: "Quality washing for all fabrics",
      image: washingImg,
      alt: "Washing",
      animation: pulseAnimation,
      details: [
        "Fabric-appropriate water temperature selection",
        "High-quality detergents for all fabric types",
        "Thorough rinse cycle to remove all soap residue",
        "Gentle handling to prevent stretching or damage",
        "Quick drying to prevent mildew or odors"
      ]
    },
  ];

  const [hoveredService, setHoveredService] = useState<number | null>(null);

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
          <p>Services All over Hyderabad</p>
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
              animate={hoveredService === index ? { scale: 1.05 } : { scale: 1 }}
              transition={{ duration: 0.3 }}
              className="h-full"
              onMouseEnter={() => setHoveredService(index)}
              onMouseLeave={() => setHoveredService(null)}
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
                  
                  {hoveredService === index && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 bg-gray-50 p-3 rounded-md"
                    >
                      <h4 className="font-semibold mb-2 text-sm">Service Features:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {service.details.map((detail, i) => (
                          <motion.li 
                            key={i}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start"
                          >
                            <span className="text-blue-500 mr-2">•</span>
                            {detail}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </CardContent>
                <CardFooter>
                  <HoverCard>
                    
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">{service.title} Details</h4>
                        <p className="text-sm text-muted-foreground">
                          Our {service.title.toLowerCase()} service includes professional handling with the following features:
                        </p>
                        <ul className="text-sm space-y-1">
                          {service.details.map((detail, i) => (
                            <li key={i} className="flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
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

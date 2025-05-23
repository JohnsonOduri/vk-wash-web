import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const pricingData = [
	{
		title: 'Basic Wash',
		price: 'Standard',
		description: 'Perfect for everyday clothing items',
		features: [
			'Standard Washing',
			'Standard Drying',
			'Basic Folding',
			'72-Hour Turnaround',
			'Pick-up Available',
		],
		popular: false,
		buttonText: '3-4 Day Turnaround',
		image: 'public/lovable-uploads/basic-wash.jpg',
		category: 'regular',
	},
	{
		title: 'Premium Wash & Iron',
		price: '+20% on Standard',
		description: 'Our most popular service for busy professionals',
		features: [
			'Premium Washing',
			'Stain Treatment',
			'Professional Ironing',
			'Organized Packaging',
			'Free Delivery & Pick-up',
		],
		popular: true,
		buttonText: '2-3 Day Turnaround',
		image: 'public/lovable-uploads/premium-wash.jpg',
		category: 'premium',
	},
	{
		title: 'Express Services',
		price: '+50% on Standard',
		description: 'Complete care for all your garments',
		features: [
			'Premium Washing',
			'Professional Ironing',
			'Stain Treatment',
			'Same-Day Service',
			'Priority Scheduling',
		],
		popular: false,
		buttonText: '24-Hour Turnaround',
		image: 'public/lovable-uploads/express-services.jpg',
		category: 'express',
	},
];

const Pricing = () => {
	const [hoveredPlan, setHoveredPlan] = useState<number | null>(null);
	const navigate = useNavigate();

	function scrollToSection(sectionId: string): void {
		const section = document.getElementById(sectionId);
		if (section) {
			section.scrollIntoView({ behavior: 'smooth' });
		} else {
			console.error(`Section with ID "${sectionId}" not found.`);
		}
	}

	const handleViewPricing = (category: string) => {
		navigate(`/item-pricing/${category}`);
	};

	return (
		<section id="pricing" className="section-padding">
			<div className="container-custom">
				<h2 className="section-title">Simple Pricing</h2>
				<p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
					Choose the plan that works best for your needs. All plans include our
					quality guarantee and eco-friendly cleaning products.
				</p>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{pricingData.map((plan, index) => (
						<motion.div
							key={index}
							animate={hoveredPlan === index ? { scale: 1.05 } : { scale: 1 }}
							transition={{ duration: 0.3 }}
							onMouseEnter={() => setHoveredPlan(index)}
							onMouseLeave={() => setHoveredPlan(null)}
						>
							<Card
								className={`relative border-none overflow-hidden rounded-lg shadow-lg ${
									plan.popular ? 'shadow-md' : ''
								}`}
								style={{
									backgroundImage: `url(${plan.image})`,
									backgroundSize: 'cover',
									backgroundPosition: 'center',
								}}
							>
								<div className="absolute inset-0 bg-black bg-opacity-50 "></div>
								<div className="relative z-10 p-6 text-white">
									{plan.popular && (
										<div
											className="absolute -top-4 left-0 right-0 mx-auto w-fit px-4 py-1 bg-blue text-white text-sm font-medium rounded-full z-20"
											style={{ transform: 'translateY(-50%)' }}
										>
											Most Popular
										</div>
									)}
									<CardHeader>
										<CardTitle className="text-3xl font-bold text-white">
											{plan.title}
										</CardTitle>
										<div className="mt-4 mb-2 text-white">
											<span className="text-2xl font-bold">
												{plan.price} Pricing
											</span>
										</div>
										<CardDescription className="text-base text-white">
											{plan.description}
										</CardDescription>
									</CardHeader>
									<CardContent>
										<ul className="space-y-3">
											{plan.features.map((feature, i) => (
												<li key={i} className="flex items-start">
													<span className="text-blue-300 mr-2">✓</span>
													<span>{feature}</span>
												</li>
											))}
										</ul>
									</CardContent>
									<CardFooter>
										<Button
											className={`w-full ${
												plan.popular
													? 'btn-primary'
													: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
											}`}
											onClick={() => handleViewPricing(plan.category)}
										>
											View {plan.title} Prices
										</Button>
									</CardFooter>
								</div>
							</Card>
						</motion.div>
					))}
				</div>

				<div className="mt-12 text-center">
					<p className="text-gray-600 mb-4">
						Need a custom solution for your business?
					</p>
					<Button onClick={() => scrollToSection('contact')}>
						Contact Us for a Custom Quote
					</Button>
				</div>
			</div>
		</section>
	);
};

export default Pricing;

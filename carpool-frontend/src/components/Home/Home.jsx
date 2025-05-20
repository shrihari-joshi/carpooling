import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Users,
    Route,
    PercentCircle,
    BadgeCheck,
    Leaf,
    Wallet,
} from 'lucide-react';
import './Home.css';



// Reusable component for benefits section
const BenefitCard = ({ title, description, icon: Icon }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="benefit-card"
    >
        <span className="benefit-icon">
            <Icon className="icon" />
        </span>
        <h3 className="benefit-title">{title}</h3>
        <p className="benefit-description">{description}</p>
    </motion.div>
);

const Home = () => {
    const titleRef = useRef(null);

    useEffect(() => {
        import('gsap').then(({ gsap }) => {
            if (titleRef.current) {
                gsap.from(titleRef.current, {
                    opacity: 1,
                    y: -50,
                    duration: 2,
                    delay: 0.5,
                });
            }
        });
    }, []);

    return (
        <div className="landing-page">
            <div className="main-content">
                <div className="text-center space-y-6 md:space-y-8">
                    <h1 ref={titleRef} className="main-title">
                        Wheel Mates
                    </h1>
                    <p className="main-description">
                        Connect, Share Rides, and Save.
                        <br />Your community-driven carpooling solution.
                    </p>
                    <div className="button-container">
                        <button className="get-started-button" onClick={() => window.location.href = '/login'}>
                            Get Started <ArrowRight className="ml-2 w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="benefits-section">
                <div className="container mx-auto space-y-12">
                    <h2 className="benefits-header">Why Choose Wheel Mates?</h2>
                    <div className="benefits-grid">
                        <BenefitCard
                            title="Save Money"
                            description="Reduce your commuting costs by sharing rides and splitting expenses."
                            icon={Wallet}
                        />
                        <BenefitCard
                            title="Reduce Traffic"
                            description="Help decrease the number of cars on the road, easing congestion."
                            icon={Route}
                        />
                        <BenefitCard
                            title="Eco-Friendly"
                            description="Lower your carbon footprint by sharing rides and reducing emissions."
                            icon={Leaf}
                        />
                        <BenefitCard
                            title="Community"
                            description="Connect with people in your community and build new relationships."
                            icon={Users}
                        />
                        <BenefitCard
                            title="Save Time"
                            description="Reduce travel time."
                            icon={PercentCircle}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const SupportContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
    text-align: center;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
`;

const Title = styled(motion.h1)`
    font-size: 3rem;
    margin-bottom: 2rem;
    color: #333;
`;

const Description = styled(motion.p)`
    font-size: 1.2rem;
    max-width: 600px;
    margin-bottom: 3rem;
    line-height: 1.6;
    color: #555;
`;

const PatreonButton = styled(motion.a)`
    padding: 1rem 2rem;
    font-size: 1.2rem;
    font-weight: bold;
    background-color: #F96854; /* Patreon color */
    color: white;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    text-decoration: none;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
    }
`;

const HeartIcon = styled(motion.div)`
    font-size: 5rem;
    margin-bottom: 2rem;
    color: #F96854;
`;

export const SupportUsPage: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <SupportContainer>
            <HeartIcon
                initial={{ scale: 0 }}
                animate={{ scale: isVisible ? [1, 1.2, 1] : 0 }}
                transition={{ duration: 1, times: [0, 0.5, 1] }}
            >
                ❤️
            </HeartIcon>

            <Title
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -50 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                Support Our Development
            </Title>

            <Description
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.8, delay: 0.5 }}
            >
                We're working hard to make this app better every day. Your support helps us continue
                improving features, fixing bugs, and creating new content. Consider supporting us
                to help keep this project alive and thriving!
            </Description>

            <PatreonButton
                href="https://www.patreon.com/JoTo_org" // Replace with your actual Patreon URL
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                    opacity: isVisible ? 1 : 0, 
                    scale: isVisible ? 1 : 0.8,
                    y: isVisible ? [0, -10, 0] : 0
                }}
                transition={{ 
                    duration: 1, 
                    delay: 0.8,
                    y: { repeat: Infinity, repeatType: "reverse", duration: 1.5, ease: "easeInOut" }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                Support Us on Patreon
            </PatreonButton>
        </SupportContainer>
    );
};

export default SupportUsPage;
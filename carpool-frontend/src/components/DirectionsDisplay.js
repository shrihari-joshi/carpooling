import React from 'react';

const DirectionsDisplay = ({ geminiLoading, geminiError, geminiDirections }) => {
    const formatDirections = (text) => {
        if (!text) return null;

        // Remove all asterisks and unwanted sentences
        let cleanedText = text.replace(/\*/g, '');
        cleanedText = cleanedText.replace(/\[DROP OFF PASSENGER\]:\s*/g, '');
        cleanedText = cleanedText.replace(/\[PICK UP PASSENGER\]:\s*/g, '');
        cleanedText = cleanedText.replace(/Google Maps Links:\s*Route View on Google Maps:\s*\[/g, '');
        cleanedText = cleanedText.replace(/Disclaimer:/gi, '');
        cleanedText = cleanedText.replace(/Traffic/gi, '');
        cleanedText = cleanedText.replace(/time of day/gi, '');
        cleanedText = cleanedText.replace(/Safely pull over to the side of the road.*?disembark\./gi, '');
        cleanedText = cleanedText.replace(/Route:.*?Drop-off at Churchgate\./gi, '');

        // Highlight links and format paragraphs
        const paragraphs = cleanedText.split('\n').filter(p => p.trim());

        const formattedParagraphs = [];
        let parkingTips = null;
        let tollTips = null;
        let googleMapsLink = null; // Store Google Maps link separately

        paragraphs.forEach((paragraph, index) => {
            // Check for Google Maps link pattern
            const googleMapsLinkRegex = /(https?:\/\/www\.google\.com\/maps\/.*)/;
            const match = paragraph.match(googleMapsLinkRegex);

            if (match) {
                // Store Google Maps link and remove it from paragraphs
                googleMapsLink = (
                    <p key="google-maps-link">
                        <strong>Redirect to Google Maps for Navigation:</strong>{' '}
                        <a href={match[0]} target="_blank" rel="noopener noreferrer">
                            <strong>open in maps</strong>
                        </a>
                    </p>
                );
            } else {
                // Check for other links, and remove them.
                const otherLinkRegex = /(https?:\/\/[^\s]+)/g;
                const paragraphWithoutOtherLinks = paragraph.replace(otherLinkRegex, '');

                // Check for parking tips
                if (paragraphWithoutOtherLinks.toLowerCase().includes("parking tips")) {
                    parkingTips = <p key="parking-tips"><strong>{paragraphWithoutOtherLinks}</strong></p>;
                }
                //check for toll tips
                else if (paragraphWithoutOtherLinks.toLowerCase().includes("toll tips")) {
                    tollTips = <p key="toll-tips"><strong>{paragraphWithoutOtherLinks}</strong></p>
                }
                else {
                    formattedParagraphs.push(<p key={`paragraph-${index}`}>{paragraphWithoutOtherLinks}</p>);
                }
            }
        });
        console.log('yes directions are fetched')

        return (
            <>
                {googleMapsLink} {/* Render Google Maps link at the top */}
                {parkingTips}
                {tollTips}
                {formattedParagraphs}
            </>
        );
    };

    return (
        <div className="direction-section">
            {geminiLoading && <p>Loading directions...</p>}
            {geminiError && <p style={{ color: 'red' }}>{geminiError}</p>}
            {geminiDirections && (
                <div className="directions">
                    <h2>Directions:</h2>
                    {formatDirections(geminiDirections)}
                </div>
            )}
        </div>
    );
};

export default DirectionsDisplay;
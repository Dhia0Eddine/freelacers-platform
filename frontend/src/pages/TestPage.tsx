import React from 'react';

export default function TestPage() {
    React.useEffect(() => {
        console.log("TestPage mounted");
        document.title = "Test Page";
    }, []);

    return (
        <div style={{ 
            padding: '100px', 
            background: 'red', 
            color: 'white',
            marginTop: '100px',
            textAlign: 'center',
            fontSize: '24px'
        }}>
            This is a test page
        </div>
    );
}

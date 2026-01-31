import React, { useState, useEffect } from 'react';
import {
  render,
  useExtensionInput,
  BlockStack,
  Text,
  Heading,
  Banner,
  Button,
  Layout
} from '@shopify/checkout-ui-extensions-react';

render('Checkout::PostPurchase::Render', () => <App />);

function App() {
  const { shop, done } = useExtensionInput();
  const [message, setMessage] = useState(
    "Thank you for your purchase! You'll receive a special discount code via email for your next order."
  );

  // In a production app, you would fetch the message from your backend
  // or use Shopify metafields
  useEffect(() => {
    // Example: Fetch from backend
    // fetch(`https://your-app.com/api/extension/message?shop=${shop?.domain}`)
    //   .then(res => res.json())
    //   .then(data => setMessage(data.message))
    //   .catch(err => console.error(err));
  }, [shop]);

  return (
    <Layout>
      <BlockStack spacing="loose">
        <Heading level={1}>Thank you for your order!</Heading>
        
        <Banner status="success">
          <Text size="medium">{message}</Text>
        </Banner>
        
        <Button onPress={done}>Continue Shopping</Button>
      </BlockStack>
    </Layout>
  );
}
import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, Grid, Image, Badge, useColorModeValue } from '@chakra-ui/react';
import './HomePage.css';

const ProductCard = ({ product }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  return (
    <Box className="product-card" bg={cardBg} color={textColor}>
      <Image src={product.image || 'https://via.placeholder.com/300'} alt={product.name} className="product-image" />
      <Box p={4}>
        <Heading as="h3" size="md" mb={2}>{product.name}</Heading>
        <Text fontSize="xl" fontWeight="bold" mb={2}>${product.price.toFixed(2)}</Text>
        <Text fontSize="sm" mb={4} noOfLines={3}>{product.description}</Text>
        <Badge colorScheme="teal" fontSize="sm">New</Badge>
      </Box>
    </Box>
  );
};

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setProducts(data.data);
        }
      })
      .catch(error => console.error('Error:', error));
  }, []);

  return (
    <Box className="home-page" bg={bgColor}>
      <Box maxWidth="1200px" margin="0 auto" padding={8}>
        <Heading as="h1" size="2xl" mb={8} textAlign="center">Our Products</Heading>
        <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={6}>
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default HomePage;

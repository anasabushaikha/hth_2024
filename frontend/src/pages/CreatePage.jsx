import React, { useState } from 'react';
import { Container, Input, Button } from '@chakra-ui/react';
import './CreatePage.css';
import useProductStore from '../store/product';
// const CreatePage = () => {
//   return (
//     <Box className="create-page">
//       <Grid templateColumns="repeat(12, 1fr)" gap={6} className="create-grid">
//         <GridItem colSpan={{ base: 12, lg: 5 }} className="form-section">
//           <Heading as="h1" size="xl" mb={6} className="page-title">
//             Create Product
//           </Heading>
//           <form>
//             <FormControl mb={4}>
//               <FormLabel>Product Name</FormLabel>
//               <Input type="text" placeholder="Enter product name" />
//             </FormControl>
//             <FormControl mb={4}>
//               <FormLabel>Description</FormLabel>
//               <Textarea placeholder="Enter product description" rows={5} />
//             </FormControl>
//             <FormControl mb={4}>
//               <FormLabel>Price</FormLabel>
//               <Input type="number" placeholder="Enter price" />
//             </FormControl>
//             <FormControl mb={4}>
//               <FormLabel>Image URL</FormLabel>
//               <Input type="url" placeholder="Enter image URL" />
//             </FormControl>
//             <Button type="submit" colorScheme="blue" size="lg" width="full">
//               Create Product
//             </Button>
//           </form>
//         </GridItem>
//         <GridItem colSpan={{ base: 12, lg: 7 }} className="preview-section">
//           <Heading as="h2" size="lg" mb={6}>
//             Product Preview
//           </Heading>
//           <Box className="preview-card">
//             <Image src="https://via.placeholder.com/400" alt="Product Preview" className="preview-image" />
//             <Box className="preview-details">
//               <Text fontSize="2xl" fontWeight="bold" mb={2}>Product Name</Text>
//               <Text fontSize="xl" mb={4}>$0.00</Text>
//               <Text>Product description will appear here. Enter details in the form to see a live preview of your product.</Text>
//             </Box>
//           </Box>
//         </GridItem>
//       </Grid>
//     </Box>
//   );
// };


const CreatePage = () => {
    const [newProduct, setNewProduct] = useState({
        name: "",
        price: "",
        image: "",
    });

    const {createProduct} = useProductStore();

    const handleAddProduct = () => {
        const {success, message} = createProduct(newProduct);
        console.log(success, message);
    }
    

    return (
        <Container maxW={"container.sm"}>
            <Input 
                placeholder="Product Name" 
                value={newProduct.name} 
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} 
                mb={3}
            />
            <Input 
                type="number"
                placeholder="Product Price" 
                value={newProduct.price} 
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} 
                mb={3}
            />
            <Input 
                placeholder="Product Image" 
                value={newProduct.image} 
                onChange={(e) => setNewProduct({...newProduct, image: e.target.value})} 
                mb={3}
            />
            <Button onClick={handleAddProduct}>Add Product</Button>
        </Container>
    );
};

export default CreatePage;
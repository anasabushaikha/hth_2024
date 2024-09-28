import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  colors: {
    pastel: {
      pink: '#FFD1DC',
      blue: '#BFEAF5',
      green: '#D0F0C0',
      yellow: '#FFFACD',
      purple: '#E6E6FA',
    },
  },
  fonts: {
    body: 'Roboto, sans-serif',
    heading: 'Poppins, sans-serif',
  },
})

export default theme
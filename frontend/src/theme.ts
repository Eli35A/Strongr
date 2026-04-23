import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#FF5A5F',
            light: '#FF8A8E',
            dark: '#D32F2F',
        },
        secondary: {
            main: '#f48fb1',
        },
        background: {
            default: '#0a1929',
            paper: '#001e3c',
        },
    },
    typography: {
        fontFamily: '"Barlow", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700 },
        h2: { fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700 },
        h3: { fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700 },
        h4: { fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 600 },
        h5: { fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 600 },
        h6: { fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 600 },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: '10px 24px',
                    transition: 'all 0.2s ease',
                },
                containedPrimary: {
                    '&:hover': {
                        boxShadow: '0 4px 16px rgba(255, 90, 95, 0.45)',
                        transform: 'translateY(-1px)',
                    },
                    '&:active': {
                        transform: 'translateY(0)',
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 10,
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                },
            },
        },
        MuiAvatar: {
            styleOverrides: {
                root: {
                    border: '2px solid rgba(255, 90, 95, 0.25)',
                },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: {
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    transition: 'all 0.15s ease',
                },
            },
        },
    },
});

export default theme;

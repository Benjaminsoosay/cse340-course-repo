// controllers/homeController.js
export const showHomePage = (req, res) => {
    res.render('home', { 
        title: 'Home',
        user: req.session.user || null
    });
};
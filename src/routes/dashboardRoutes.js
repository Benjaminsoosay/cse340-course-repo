router.get('/dashboard/volunteering', requireLogin, async (req, res) => {
    const userId = req.session.user.id;
    const projects = await getUserVolunteerProjects(userId);
    res.render('volunteering', { projects, user: req.session.user });
});
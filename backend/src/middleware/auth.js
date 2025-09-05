
function requireLogin(request, response, next){
    console.log("Session data: ", request.session);
    if(!request.session.userId){
        return response.status(401).json({
            success: false,
            message: "Unauthorised"
        });
    }
    next();
}

module.exports = requireLogin;

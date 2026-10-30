

const globalError = (err, req, res, next) => {
    console.log(err.stack);

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        message: statusCode >= 500 && process.env.NODE_ENV === 'production' ? 'Internal Server Error': err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === "development" && {stack: err.stack})
    });
};

export default globalError;
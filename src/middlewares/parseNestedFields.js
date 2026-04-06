const parseNestedFields = (req, res, next) => {
    try {
        const FIELDS = ["objectives"];

        for (const field of FIELDS) {
            if (typeof req.body[field] === "string") {
                req.body[field] = JSON.parse(req.body[field]);
            }
        }

        next();
    } catch {
        next(new Error("Dữ liệu JSON không hợp lệ trong request body"));
    }
};

module.exports = parseNestedFields;
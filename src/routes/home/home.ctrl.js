const home = (req, res) => {
	res.render('home/index');
};

const memberfind = (req, res) => {
	res.render('member/memberfind');
};

const membership = (req, res) => {
	res.render('member/membership');
};

const test_make = (req, res) => {
	res.render('making/Test_Make');
};

const dispose_01 = (req, res) => {
	res.render('making/dispose_01');
};

module.exports = {
	home,
	memberfind,
	membership,
	test_make,
	dispose_01,
};
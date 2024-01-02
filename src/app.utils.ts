import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { generate } from 'randomstring';


const PASSWORD_RULE =
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

const PASSWORD_RULE_MESSAGE =
  'Password should have at least 1 uppercase, lowercase, along with a number and a special character';

const VALIDATION_PIPE = new ValidationPipe({
  errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
});

export const REGEX = {
  PASSWORD_RULE,
};

export const MESSAGE = {
  PASSWORD_RULE_MESSAGE,
};

export const SETTINGS = {
  VALIDATION_PIPE,
};

export const generateInvoiceNumber = () => {
	const prefix = "EBI-";
	const suffix = generate({
		length: 6,
		charset: "numeric",
	});
	const id = prefix + suffix.padStart(6, "0");

	return id;
};

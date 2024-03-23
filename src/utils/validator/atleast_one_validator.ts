import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: true })
export class AtLeastOneFieldNotEmptyConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    const properties = args.constraints[0];
    const val = args.object as any;

    for (const property of properties) {
      if (
        val[property] !== null &&
        val[property] !== undefined &&
        val[property] !== ''
      ) {
        return true; // At least one property is not empty
      }
    }
    return false; // None of the properties are non-empty
  }

  defaultMessage(args: ValidationArguments) {
    return 'At least one of the fields must be not empty.';
  }
}

export function AtLeastOneFieldNotEmpty(
  propertyNames: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'atLeastOneFieldNotEmpty',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [propertyNames],
      options: validationOptions,
      validator: AtLeastOneFieldNotEmptyConstraint,
    });
  };
}

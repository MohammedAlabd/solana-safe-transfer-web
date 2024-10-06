'use client';

import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Stack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useSolanaSafeProgram } from '../program/useSolanaSafeProgram';
import { Form, Formik } from 'formik';
import * as yup from 'yup';
import { isSolanaPublicKey } from '@/utils/helpers';
import { PublicKey } from '@solana/web3.js';

const validationSchema = yup.object().shape({
  amount: yup.number().min(0).required('Amount is required'),
  confirmationCode: yup.string().required('Confirmation code is required'),
  address: yup
    .string()
    .test('is-valid-solana-public-key', 'Invalid Solana public key', (value) => isSolanaPublicKey(value ?? ''))
    .required('Public key is required'),
});

export default function TransferSOLForm() {
  const { safeTransferSOL } = useSolanaSafeProgram();
  const initialValues = {
    amount: 0,
    address: '',
    confirmationCode: '',
  };

  return (
    <Flex minH={'100vh'} align={'center'} justify={'center'} bg={useColorModeValue('gray.50', 'gray.800')}>
      <Stack
        spacing={4}
        w={'full'}
        maxW={'md'}
        bg={useColorModeValue('white', 'gray.700')}
        rounded={'xl'}
        boxShadow={'lg'}
        p={6}
        my={12}
      >
        <Heading lineHeight={1.1} fontSize={{ base: '2xl', md: '3xl' }}>
          Safe Transfer SOL
        </Heading>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values, actions) => {
            await safeTransferSOL({
              reciverPublicKey: new PublicKey(values.address),
              confirmationCode: values.confirmationCode,
              amount: values.amount,
            });

            actions.setSubmitting(false);
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form>
              <FormControl isRequired isInvalid={Boolean(errors.amount && touched.amount)}>
                <FormLabel>Amount</FormLabel>
                <Input
                  type="number"
                  name="amount"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.amount}
                  placeholder="0.1"
                />
                {errors.amount && touched.amount && <FormErrorMessage>{errors.amount}</FormErrorMessage>}
              </FormControl>

              <FormControl isRequired isInvalid={Boolean(errors.address && touched.address)}>
                <FormLabel>Address</FormLabel>
                <Input
                  type="string"
                  name="address"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.address}
                  autoComplete="on"
                />
                {errors.address && touched.address && <FormErrorMessage>{errors.address}</FormErrorMessage>}
              </FormControl>

              <FormControl isRequired isInvalid={Boolean(errors.confirmationCode && touched.confirmationCode)}>
                <FormLabel>Confirmation Code</FormLabel>
                <Input
                  type="string"
                  name="confirmationCode"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.confirmationCode}
                  autoComplete="on"
                />

                {errors.confirmationCode && touched.confirmationCode && (
                  <FormErrorMessage>{errors.confirmationCode}</FormErrorMessage>
                )}
              </FormControl>

              <Button mt={4} colorScheme="teal" isLoading={isSubmitting} type="submit">
                Submit
              </Button>
            </Form>
          )}
        </Formik>
        {/* <FormControl id="amount" isRequired> */}
        {/*   <FormLabel>Amount</FormLabel> */}
        {/*   <Input disabled={isLoading} placeholder="0.1" _placeholder={{ color: 'gray.500' }} type="number" /> */}
        {/* </FormControl> */}
        {/* <FormControl id="address" isRequired> */}
        {/*   <FormLabel>Address</FormLabel> */}
        {/*   <Input disabled={isLoading} type="text" /> */}
        {/* </FormControl> */}
        {/* <FormControl id="confirmation-code" isRequired> */}
        {/*   <FormLabel>Confirmation Code</FormLabel> */}
        {/*   <Input disabled={isLoading} type="text" /> */}
        {/* </FormControl> */}
        {/* <Stack spacing={6}> */}
        {/*   <Button */}
        {/*     bg={'blue.400'} */}
        {/*     color={'white'} */}
        {/*     _hover={{ */}
        {/*       bg: 'blue.500', */}
        {/*     }} */}
        {/*     isLoading={isLoading} */}
        {/*     onClick={handleSubmit} */}
        {/*   > */}
        {/*     Submit */}
        {/*   </Button> */}
        {/* </Stack> */}
      </Stack>
    </Flex>
  );
}

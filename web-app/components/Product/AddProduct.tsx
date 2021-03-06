import React, { useEffect, useState } from 'react'
import {
    Grid,
    TextField,
    Button
} from '@material-ui/core'
import InputAdornment from '@material-ui/core/InputAdornment';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { Formik, Form, FormikProps } from 'formik'
import * as Yup from 'yup'
import { useRouter } from 'next/router';
import { useDropzone } from 'react-dropzone';
import { useQuery, useMutation, useLazyQuery } from '@apollo/react-hooks';
import { createProduct, createProductVariables } from '../../graphql/generated/createProduct';
import Message, { TOGGLE_SNACKBAR_MUTATION } from '../Material/SuccessMessage';
import { GET_CATEGORIES } from '../Category/CategoryQuery';
import { CREATE_PRODUCT } from './ProductMutation';
import { categories, categoriesVariables } from '../../graphql/generated/categories';
import { GET_PRODUCTS } from './ProductQuery';
import { useStyles } from './AddProductStyle';
import { ParentCategoriesWithIcon as ParentCategories } from '../Category/ParentCategories'

interface NewProductForm {
    prodName: string
    description: string
    discount: number
    price: number
    salePrice: number
    sku: string
    unit: string
    slug: string
    parentCategory: string
    childCategories: string
}

const AddProduct: React.FunctionComponent = () => {
    const classes = useStyles();
    const router = useRouter();

    const [isFormSubmiting, setFormSubmittingStatus] = useState(true);
    const [childCategories, setChildCategories] = useState([{ name: '', id: '' }]);

    const [messageMutation] = useMutation(TOGGLE_SNACKBAR_MUTATION);

    const [getCategories] = useLazyQuery<categories, categoriesVariables>(GET_CATEGORIES, {
        onCompleted: (data) => {
            setChildCategories(data.categories.nodes)
        },
    });

    useQuery(GET_PRODUCTS);
    interface ImageProperties {
        image: string;
    }

    const [totalFilesToUpload, setTotalFilesToUpload] = React.useState(0);
    const [totalFilesUploaded, setTotalFilesUploaded] = useState<ImageProperties[]>([]);

    //////////////////////////////////////////////
    const [files, setFiles] = useState([]);
    const { getRootProps, getInputProps } = useDropzone({
        accept: 'image/*',
        onDrop: acceptedFiles => {

            setTotalFilesUploaded([])
            setTotalFilesToUpload(0)

            let arr: any = []
            acceptedFiles.forEach((file, j) => {
                arr.push({
                    name: file.name,
                    preview: URL.createObjectURL(file)
                })
            })
            setFiles(arr)

            let arr1: any = []

            const uploadPreset = process.env.IMAGE_UPLOAD_PRESET as string;
            const uploadUrl = process.env.IMAGE_UPLOAD_URL as string;

            acceptedFiles.map(async (file) => {
                const data = new FormData();
                data.append('file', file);
                data.append('upload_preset', uploadPreset);

                const res = await fetch(uploadUrl, {
                    method: 'post',
                    body: data
                }); setTotalFilesUploaded
                const resFile = await res.json()
                if (resFile) {
                    const url = resFile.secure_url
                    const length = arr1.push({ image: url })
                    setTotalFilesUploaded(arr1)
                    setTotalFilesToUpload(length)
                }
            })
        }
    });

    interface UploadFile {
        name: string
        preview: string
    }

    const thumbs = files.map((file: UploadFile) => (
        <div className={classes.thumb} key={file.name}>
            <div className={classes.thumbInner}>
                <img
                    src={file.preview}
                    className={classes.img}
                />
            </div>
        </div>
    ));


    useEffect(() => () => {
        // Make sure to revoke the data uris to avoid memory leaks
        files.forEach((file: UploadFile) => URL.revokeObjectURL(file.preview));
        console.log('Use Effect', files.length, totalFilesUploaded.length)
        setFormSubmittingStatus(files.length !== totalFilesUploaded.length)
    }, [files, totalFilesToUpload, totalFilesUploaded]);

    const [createProduct] = useMutation<createProduct, createProductVariables>(CREATE_PRODUCT, {
        // onError: (error) => {
        // },
        onCompleted: (data) => {
            messageMutation({
                variables: { msg: 'Product added successfully', type: 'success' }
            })
            setTimeout(() => {
                router.push('/products');
            }, 100)
        },
        update(cache, { data }) {
            const cacheData: any = cache.readQuery({ query: GET_PRODUCTS });
            if (data) {
                cacheData.products.nodes.push(data.createProduct)
            }
        }
    });

    const createNewProduct = async (data: NewProductForm, resetForm: Function) => {
        // console.log('Called fx createNewProduct')
        // API call integration will be here. Handle success / error response accordingly.
        if (data) {

            const newProduct = {
                name: data.prodName,
                description: data.description,
                discount: (data.discount),
                price: (data.price),
                salePrice: (data.salePrice),
                sku: data.sku,
                unit: data.unit,
                categoryId: data.childCategories,
                images: totalFilesUploaded
            };

            createProduct({
                variables: newProduct
            }).then(data => {

            }).catch(err => {
                messageMutation({
                    variables: { msg: err.message, type: 'error' }
                })
            });
        }
    }

    const FileUploading = () => {
        if (totalFilesToUpload === 0) {
            return <span></span>
        } else if (totalFilesToUpload > 0) {
            if (totalFilesUploaded.length > 0) {
                return <span>{totalFilesUploaded.length} file(s) uploaded. </span>
            } else {
                return <span>Uploading. </span>
            }
        } else {
            return <span></span>
        }
    }

    return (
        <div className={classes.root}>
            <Formik
                initialValues={{
                    prodName: '',
                    description: '',
                    discount: 0,
                    price: 0,
                    salePrice: 0,
                    sku: '',
                    unit: '',
                    slug: '',
                    parentCategory: '',
                    childCategories: ''
                }}
                onSubmit={(values: NewProductForm, actions) => {
                    createNewProduct(values, actions.resetForm)
                    setTimeout(() => {
                        // actions.setSubmitting(false)
                    }, 500)
                }}
                validationSchema={Yup.object().shape({

                    prodName: Yup.string().required('Please enter category name'),
                    description: Yup.string().required('Please enter description'),
                    discount: Yup.number().min(1, 'Please enter discount').max(100, 'Please enter valid discount in percent').required('Please enter discount'),
                    price: Yup.number().min(1, 'Please enter price').required('Please enter price'),
                    // salePrice: Yup.number().min(1, 'Please enter salePrice').required('Please enter salePrice'),
                    sku: Yup.string().required('Please enter sku'),
                    unit: Yup.string().required('Please enter unit'),
                    parentCategory: Yup.string().required('Please select parent category'),
                    childCategories: Yup.string().required('Please select parent category'),
                })}
            >
                {(props: FormikProps<NewProductForm>) => {
                    const {
                        values,
                        touched,
                        errors,
                        handleBlur,
                        setFieldValue,
                        handleChange,
                        isSubmitting,
                    } = props

                    return (
                        <Form>
                            <Message />

                            <Grid
                                container
                                direction="row"

                                alignItems="flex-end"
                                spacing={1}
                            >
                                <Grid
                                    item
                                    md={3}
                                    sm={10}
                                    xs={10}
                                    className={classes.textField}
                                >
                                    <TextField
                                        name="prodName"
                                        id="prodName"
                                        label="Name"
                                        value={values.prodName}
                                        type="text"
                                        fullWidth
                                        variant="outlined"
                                        margin="normal"
                                        helperText={
                                            errors.prodName && touched.prodName
                                                ? errors.prodName
                                                : 'Enter product name.'
                                        }
                                        error={
                                            errors.prodName && touched.prodName
                                                ? true
                                                : false
                                        }
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                </Grid>

                                <Grid
                                    item
                                    md={9}
                                    sm={10}
                                    xs={10}
                                    className={classes.textField}
                                >
                                    <TextField
                                        name="description"
                                        id="description"
                                        label="Description"
                                        fullWidth
                                        variant="outlined"
                                        margin="normal"
                                        value={values.description}
                                        type="text"
                                        helperText={
                                            errors.description && touched.description
                                                ? errors.description
                                                : 'Enter description.'
                                        }
                                        error={
                                            errors.description && touched.description
                                                ? true
                                                : false
                                        }
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                </Grid>

                                <Grid
                                    item

                                    md={3}
                                    sm={10}
                                    xs={10}
                                    className={classes.textField}
                                >
                                    <TextField
                                        name="price"
                                        id="price"
                                        label="price"
                                        fullWidth
                                        variant="outlined"
                                        margin="normal"
                                        value={values.price === 0 ? '' : values.price}
                                        type="number"
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                        }}
                                        helperText={
                                            errors.price && touched.price
                                                ? errors.price
                                                : 'Enter price.'
                                        }
                                        error={
                                            errors.price && touched.price
                                                ? true
                                                : false
                                        }
                                        onChange={handleChange}

                                        onInput={(e) => {
                                            (e.target as HTMLInputElement).value = Math.max(0, parseInt((e.target as HTMLInputElement).value)).toString().slice(0, 6)
                                        }}
                                        onBlur={e => {
                                            handleBlur(e)
                                            values.salePrice = Math.floor(values.price - (values.price * values.discount / 100))
                                        }}
                                    />
                                </Grid>

                                <Grid
                                    item

                                    md={3}
                                    sm={10}
                                    xs={10}
                                    className={classes.textField}
                                >
                                    <TextField
                                        name="discount"
                                        id="discount"
                                        label="discount in %"
                                        fullWidth
                                        variant="outlined"
                                        margin="normal"
                                        value={values.discount === 0 ? '' : values.discount}
                                        type="number"
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                        }}
                                        helperText={
                                            errors.discount && touched.discount
                                                ? errors.discount
                                                : 'Enter discount.'
                                        }
                                        error={
                                            errors.discount && touched.discount
                                                ? true
                                                : false
                                        }
                                        onInput={(e) => {
                                            (e.target as HTMLInputElement).value = Math.max(0, parseInt((e.target as HTMLInputElement).value)).toString().slice(0, 3)
                                        }}
                                        onChange={handleChange}
                                        onBlur={e => {
                                            handleBlur(e)
                                            values.salePrice = Math.floor(values.price - (values.price * values.discount / 100))
                                        }}
                                    />
                                </Grid>

                                <Grid
                                    item

                                    md={3}
                                    sm={10}
                                    xs={10}
                                    className={classes.textField}
                                >
                                    <TextField
                                        name="salePrice"
                                        id="salePrice"
                                        label="Sale price"
                                        fullWidth
                                        disabled
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                        }}
                                        variant="outlined"
                                        margin="normal"
                                        value={values.salePrice}
                                        type="number"
                                        helperText={
                                            errors.salePrice && touched.salePrice
                                                ? errors.salePrice
                                                : 'Sale price.'
                                        }
                                        error={
                                            errors.salePrice && touched.salePrice
                                                ? true
                                                : false
                                        }
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                </Grid>

                                <Grid
                                    item
                                    md={3}
                                    sm={10}
                                    xs={10}
                                    className={classes.textField}
                                >
                                    <TextField
                                        name="unit"
                                        id="unit"
                                        label="Unit"
                                        fullWidth
                                        variant="outlined"
                                        margin="normal"
                                        value={values.unit}
                                        type="text"
                                        helperText={
                                            errors.unit && touched.unit
                                                ? errors.unit
                                                : 'Enter unit.'
                                        }
                                        error={
                                            errors.unit && touched.unit
                                                ? true
                                                : false
                                        }
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                </Grid>

                                <Grid item style={{ paddingTop: 11, paddingBottom: 11 }}
                                    md={3}
                                    sm={10}
                                    xs={10}
                                    className={classes.textField}>
                                    <Autocomplete
                                        style={{}}
                                        options={ParentCategories}
                                        autoHighlight
                                        onChange={(e, value) => {
                                            console.log('Parent Cat name =>', value?.name)
                                            if (value !== null && typeof value === 'object') {
                                                getCategories({ variables: { parentQuery: value.name } })
                                                setFieldValue('parentCategory', value.name);
                                            }
                                        }}
                                        getOptionLabel={(option) => option.label}
                                        renderOption={(option) => (
                                            <React.Fragment>
                                                <span>{option.icon}</span>
                                                {option.label}
                                            </React.Fragment>
                                        )}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                helperText={
                                                    errors.parentCategory && touched.parentCategory
                                                        ? errors.parentCategory
                                                        : 'Select parent category.'
                                                }
                                                error={
                                                    errors.parentCategory && touched.parentCategory
                                                        ? true
                                                        : false
                                                }
                                                label="Choose parent Category"
                                                variant="outlined"
                                                inputProps={{
                                                    ...params.inputProps,
                                                    autoComplete: 'off', // disable autocomplete and autofill
                                                }}
                                            />
                                        )}
                                    />

                                </Grid>

                                <Grid item style={{ paddingTop: 11, paddingBottom: 11 }}
                                    md={3}
                                    sm={10}
                                    xs={10}
                                    className={classes.textField}>
                                    <Autocomplete
                                        style={{}}
                                        options={childCategories}
                                        autoHighlight
                                        onChange={(e, value) => {
                                            if (value !== null && typeof value === 'object') {
                                                setFieldValue('childCategories', value.id);
                                            }
                                        }}
                                        getOptionLabel={(option) => option.name}
                                        renderOption={(option) => (
                                            <React.Fragment>
                                                {option.name}
                                            </React.Fragment>
                                        )}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                helperText={
                                                    errors.childCategories && touched.childCategories
                                                        ? errors.childCategories
                                                        : 'Select child category.'
                                                }
                                                error={
                                                    errors.childCategories && touched.childCategories
                                                        ? true
                                                        : false
                                                }
                                                label="Choose child Category"
                                                variant="outlined"
                                                inputProps={{
                                                    ...params.inputProps,
                                                    autoComplete: 'off', // disable autocomplete and autofill
                                                }}
                                            />
                                        )}
                                    />

                                </Grid>

                                <Grid
                                    item

                                    md={6}
                                    sm={10}
                                    xs={10}
                                    className={classes.textField}
                                >
                                    <TextField
                                        name="sku"
                                        id="sku"
                                        label="SKU"
                                        fullWidth
                                        variant="outlined"
                                        margin="normal"
                                        value={values.sku}
                                        type="text"
                                        helperText={
                                            errors.sku && touched.sku
                                                ? errors.sku
                                                : 'Enter sku.'
                                        }
                                        error={
                                            errors.sku && touched.sku
                                                ? true
                                                : false
                                        }
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                </Grid>

                                <Grid
                                    item
                                    md={12}
                                    sm={12}
                                    xs={12}
                                    className={classes.uploadButton}
                                >
                                    {/* DROPZONE */}
                                    <section className={classes.FileContainer}>
                                        <div  {...getRootProps({ className: 'dropzone' })}>

                                            <input {...getInputProps()} />
                                            <p>Drag 'n' drop some product images here, or click to select files</p>
                                        </div>
                                        <aside className={classes.thumbsContainer}>
                                            {thumbs}
                                        </aside>
                                        <FileUploading />
                                    </section>
                                    {/* DROPZONE */}
                                </Grid>

                                <Grid
                                    item
                                    xs={12}
                                    className={classes.submitButton}
                                >
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        disabled={isFormSubmiting}
                                    >
                                        Submit
                                    </Button>

                                </Grid>
                            </Grid>
                        </Form>
                    )
                }}
            </Formik>
        </div>
    )
}

export default AddProduct;

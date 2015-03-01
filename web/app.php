<?php
/**
 * Created by PhpStorm.
 * User: H.R.
 * Date: 15/01/15
 * Time: 23:23
 */

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Debug\Debug;

$loader = require_once __DIR__.'/../app/bootstrap.php.cache';
require_once __DIR__.'/../app/AppKernel.php';

# enable debugging
Debug::enable();

# load kernel
//$kernel = new AppKernel( "dev", true );
$kernel = new AppKernel( "dev", true );
$kernel->loadClassCache();

# request->handle->response is all we do ;)
$request  = Request::createFromGlobals();
$response = $kernel->handle( $request );
$response->send();
$kernel->terminate( $request, $response );

